import React from "react";
import ledgersData from "@/services/mockData/ledgers.json";
import auditService from "@/services/api/auditService";
import Error from "@/components/ui/Error";

class LedgerService {
  constructor() {
    this.data = [...ledgersData]
  }

  async getAll() {
    await this.delay(250)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(l => l.Id === parseInt(id))
    if (!item) {
      throw new Error("Ledger not found")
    }
    return { ...item }
  }

async create(ledger) {
    await this.delay(300)
    const newId = Math.max(...this.data.map(l => l.Id)) + 1
    const newLedger = {
      ...ledger,
      Id: newId,
      currentBalance: ledger.openingBalance || 0,
      currency: ledger.currency || "INR",
      customFields: ledger.customFields || {}
    }
    this.data.push(newLedger)
    
    // Log the creation
    await auditService.logOperation(
      'ledger',
      newId,
      'create',
      { name: newLedger.name, group: newLedger.group, openingBalance: newLedger.openingBalance },
      null,
      newLedger
    )
    
    return { ...newLedger }
  }

async update(id, ledger) {
    await this.delay(300)
    const index = this.data.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Ledger not found")
    }
    
    const oldLedger = { ...this.data[index] }
    const updatedLedger = { ...ledger, Id: parseInt(id), currency: ledger.currency || "INR", customFields: ledger.customFields || {} }
    this.data[index] = updatedLedger
    
    // Log the update
    await auditService.logOperation(
      'ledger',
      parseInt(id),
      'update',
      { name: updatedLedger.name, group: updatedLedger.group },
      oldLedger,
      updatedLedger
    )
    
    return { ...updatedLedger }
  }

async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Ledger not found")
    }
    
    const deletedLedger = { ...this.data[index] }
    this.data.splice(index, 1)
    
    // Log the deletion
    await auditService.logOperation(
      'ledger',
      parseInt(id),
      'delete',
      null,
      deletedLedger,
      null
    )
    
    return true
  }
async getTopByBalance(limit = 10) {
    await this.delay(150)
    return [...this.data]
      .filter(ledger => ledger.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, limit)
      .map(ledger => ({ ...ledger }))
  }

  async getBalanceSummary() {
    await this.delay(100)
const totalAssets = this.data
      .filter(l => l.group && l.group.toLowerCase().includes('asset'))
      .reduce((sum, l) => sum + (l.currentBalance ?? 0), 0)
    
    const totalLiabilities = this.data
      .filter(l => l.group && l.group.toLowerCase().includes('liabil'))
      .reduce((sum, l) => sum + (l.currentBalance ?? 0), 0)
    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      count: this.data.length
    }
  }
async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(ledger =>
        ledger.name.toLowerCase().includes(searchTerm) ||
        ledger.group?.toLowerCase().includes(searchTerm) ||
        ledger.currency?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.group && filters.group !== 'all') {
      results = results.filter(ledger => ledger.group === filters.group)
    }
    
    if (filters.currency && filters.currency !== 'all') {
      results = results.filter(ledger => ledger.currency === filters.currency)
    }
    
    if (filters.gstApplicable !== undefined) {
      results = results.filter(ledger => ledger.gstApplicable === filters.gstApplicable)
    }
    
    if (filters.balanceRange) {
const { min, max } = filters.balanceRange
      results = results.filter(ledger => {
        const balance = ledger.currentBalance ?? 0
        return (!min || balance >= min) && (!max || balance <= max)
      })
    }
    
    return results
  }

  async getByGroupType(groupType) {
    await this.delay(200)
    return this.data.filter(ledger => 
      ledger.group?.toLowerCase().includes(groupType.toLowerCase())
    )
  }

  async getActiveLedgers() {
    await this.delay(200)
    return this.data.filter(ledger => ledger.isActive !== false)
  }

async getFinancialRatios() {
    await this.delay(200)
    const assets = this.data.filter(l => l.group?.toLowerCase().includes('asset'))
    const liabilities = this.data.filter(l => l.group?.toLowerCase().includes('liabil'))
    const equity = this.data.filter(l => l.group?.toLowerCase().includes('capital') || l.group?.toLowerCase().includes('equity'))
    
const totalAssets = assets.reduce((sum, l) => sum + (l.currentBalance ?? 0), 0)
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.currentBalance ?? 0), 0)
    const totalEquity = equity.reduce((sum, l) => sum + (l.currentBalance ?? 0), 0)
    
    return {
      debtToEquityRatio: totalEquity !== 0 ? totalLiabilities / totalEquity : 0,
      currentRatio: totalLiabilities !== 0 ? totalAssets / totalLiabilities : 0,
      equityRatio: totalAssets !== 0 ? totalEquity / totalAssets : 0,
      totalAssets,
      totalLiabilities,
      totalEquity
    }
  }

  async getAccountActivity(fromDate, toDate) {
    await this.delay(200)
    return this.data.map(ledger => ({
      ...ledger,
      activity: 'active', // Mock activity status
      lastTransactionDate: new Date().toISOString().split('T')[0],
      transactionCount: Math.floor(Math.random() * 50)
    }))
  }

  async getAccountBalanceTrends(months = 6) {
    await this.delay(200)
    const trends = []
    const topLedgers = this.data.slice(0, 10)
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      
trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        ledgers: topLedgers.map(ledger => ({
          id: ledger.Id,
          name: ledger.name,
          balance: (ledger.currentBalance ?? 0) * (0.8 + Math.random() * 0.4) // Mock trend variation
        }))
      })
    }
    
    return trends
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new LedgerService()