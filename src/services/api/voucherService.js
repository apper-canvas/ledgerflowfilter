import React from "react";
import vouchersData from "@/services/mockData/vouchers.json";
import auditService from "@/services/api/auditService";
import Error from "@/components/ui/Error";

class VoucherService {
  constructor() {
    this.data = [...vouchersData]
  }

  async getAll() {
    await this.delay(300)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(v => v.Id === parseInt(id))
    if (!item) {
      throw new Error("Voucher not found")
    }
return { ...item }
  }

  async create(voucher) {
    await this.delay(400)
    const newId = Math.max(...this.data.map(v => v.Id)) + 1
    const newVoucher = {
      ...voucher,
      Id: newId,
      status: "posted",
      customFields: voucher.customFields || {}
    }
    this.data.push(newVoucher)
    
    // Log the creation
    await auditService.logOperation(
      'voucher',
      newId,
      'create',
      { type: newVoucher.type, number: newVoucher.number, date: newVoucher.date },
      null,
      newVoucher
    )
    
    return { ...newVoucher }
  }

  async update(id, voucher) {
    await this.delay(400)
    const index = this.data.findIndex(v => v.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Voucher not found")
    }
    
    const oldVoucher = { ...this.data[index] }
    const updatedVoucher = { ...voucher, Id: parseInt(id), customFields: voucher.customFields || {} }
    this.data[index] = updatedVoucher
    
    // Log the update
    await auditService.logOperation(
      'voucher',
      parseInt(id),
      'update',
      { narration: updatedVoucher.narration, status: updatedVoucher.status },
      oldVoucher,
      updatedVoucher
    )
    
return { ...updatedVoucher }
  }

  async delete(id) {
await this.delay(300)
    const index = this.data.findIndex(v => v.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Voucher not found")
    }
    const deletedVoucher = { ...this.data[index] }
    this.data.splice(index, 1)
    
    // Log the deletion
    await auditService.logOperation(
      'voucher',
      parseInt(id),
      'delete',
      null,
      deletedVoucher,
      null
    )
    
    return true
  }
async getByLedgerAndDate(ledgerId, fromDate, toDate) {
    await this.delay(200)
    const filtered = this.data.filter(voucher => {
      const voucherDate = new Date(voucher.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      
      // Check if voucher date is within range
      const dateInRange = voucherDate >= from && voucherDate <= to
      
      // Check if voucher has entries for the specified ledger
      const hasLedgerEntry = voucher.entries && 
        voucher.entries.some(entry => entry.ledgerId === parseInt(ledgerId))
      
      return dateInRange && hasLedgerEntry
    })
    
    return filtered.map(voucher => ({ ...voucher }))
  }

  async getAnalytics() {
    await this.delay(150)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Monthly data for last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1)
      const monthKey = month.toISOString().slice(0, 7)
      const monthVouchers = this.data.filter(v => 
        v.date && v.date.startsWith(monthKey)
      )
      
      let revenue = 0
      let expenses = 0
monthVouchers.forEach(voucher => {
        if (voucher.entries) {
          voucher.entries.forEach(entry => {
            if (voucher.type === 'sales' || voucher.type === 'receipt') {
              revenue += (entry.amount ?? 0)
            } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
              expenses += (entry.amount ?? 0)
            }
          })
        }
      })
      monthlyData.push({
        month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        count: monthVouchers.length
      })
    }
    
return { monthlyData }
  }

  async search(query, filters = {}) {
    await this.delay(250)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(voucher =>
        voucher.number?.toLowerCase().includes(searchTerm) ||
        voucher.narration?.toLowerCase().includes(searchTerm) ||
        voucher.type?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.type && filters.type !== 'all') {
      results = results.filter(voucher => voucher.type === filters.type)
    }
    
    if (filters.status && filters.status !== 'all') {
      results = results.filter(voucher => voucher.status === filters.status)
    }
    
    if (filters.dateRange) {
      const { from, to } = filters.dateRange
      if (from || to) {
        results = results.filter(voucher => {
          const voucherDate = new Date(voucher.date)
          const fromDate = from ? new Date(from) : new Date('1900-01-01')
          const toDate = to ? new Date(to) : new Date('2100-12-31')
          return voucherDate >= fromDate && voucherDate <= toDate
        })
      }
    }
    
if (filters.amountRange) {
      const { min, max } = filters.amountRange
      results = results.filter(voucher => {
        const total = voucher.entries?.reduce((sum, entry) => 
          sum + (entry.type === "dr" ? (entry.amount ?? 0) : 0), 0) || 0
        return (!min || total >= min) && (!max || total <= max)
      })
    }
    
    return results.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  async getByType(type) {
    await this.delay(200)
    return this.data.filter(voucher => voucher.type === type)
  }

  async getByDateRange(fromDate, toDate) {
    await this.delay(200)
    return this.data.filter(voucher => {
      const voucherDate = new Date(voucher.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      return voucherDate >= from && voucherDate <= to
    })
  }

  async getRecent(limit = 10) {
    await this.delay(150)
    return [...this.data]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
}

  async getCashFlowStatement(fromDate, toDate) {
    await this.delay(300)
    const filteredVouchers = this.data.filter(v => {
      const voucherDate = new Date(v.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      return voucherDate >= from && voucherDate <= to
    })

    let operatingCashFlow = 0
    let investingCashFlow = 0
    let financingCashFlow = 0

filteredVouchers.forEach(voucher => {
      if (voucher.entries) {
        voucher.entries.forEach(entry => {
          const amount = entry.amount ?? 0
          if (voucher.type === 'sales' || voucher.type === 'receipt') {
            operatingCashFlow += amount
          } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
            if (voucher.narration?.toLowerCase().includes('equipment') || 
                voucher.narration?.toLowerCase().includes('asset')) {
              investingCashFlow -= amount
            } else if (voucher.narration?.toLowerCase().includes('loan') || 
                       voucher.narration?.toLowerCase().includes('capital')) {
              financingCashFlow += voucher.type === 'receipt' ? amount : -amount
            } else {
              operatingCashFlow -= amount
            }
          }
        })
      }
    })

    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow
    }
  }

  async getVarianceAnalysis(currentFromDate, currentToDate, previousFromDate, previousToDate) {
    await this.delay(300)
    const currentPeriod = await this.getAnalyticsSummary(currentFromDate, currentToDate)
    const previousPeriod = await this.getAnalyticsSummary(previousFromDate, previousToDate)

    return {
      revenue: {
        current: currentPeriod.totalRevenue,
        previous: previousPeriod.totalRevenue,
        variance: currentPeriod.totalRevenue - previousPeriod.totalRevenue,
        variancePercent: previousPeriod.totalRevenue !== 0 ? 
          ((currentPeriod.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue) * 100 : 0
      },
      expenses: {
        current: currentPeriod.totalExpenses,
        previous: previousPeriod.totalExpenses,
        variance: currentPeriod.totalExpenses - previousPeriod.totalExpenses,
        variancePercent: previousPeriod.totalExpenses !== 0 ? 
          ((currentPeriod.totalExpenses - previousPeriod.totalExpenses) / previousPeriod.totalExpenses) * 100 : 0
      }
    }
  }

  async getAnalyticsSummary(fromDate, toDate) {
    await this.delay(200)
    const filteredVouchers = this.data.filter(v => {
      const voucherDate = new Date(v.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      return voucherDate >= from && voucherDate <= to
    })

    let totalRevenue = 0
    let totalExpenses = 0
    const voucherTypeCounts = {}

filteredVouchers.forEach(voucher => {
      voucherTypeCounts[voucher.type] = (voucherTypeCounts[voucher.type] || 0) + 1
      
      if (voucher.entries) {
        voucher.entries.forEach(entry => {
          if (voucher.type === 'sales' || voucher.type === 'receipt') {
            totalRevenue += (entry.amount ?? 0)
          } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
            totalExpenses += (entry.amount ?? 0)
          }
        })
      }
    })

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      voucherCount: filteredVouchers.length,
      voucherTypeCounts
    }
  }

  async getTopTransactions(limit = 10, fromDate, toDate) {
    await this.delay(200)
    let filteredVouchers = [...this.data]
    
    if (fromDate && toDate) {
      filteredVouchers = filteredVouchers.filter(v => {
        const voucherDate = new Date(v.date)
        const from = new Date(fromDate)
        const to = new Date(toDate)
        return voucherDate >= from && voucherDate <= to
      })
    }
return filteredVouchers
      .map(voucher => ({
        ...voucher,
        totalAmount: voucher.entries?.reduce((sum, entry) => 
          sum + (entry.type === "dr" ? (entry.amount ?? 0) : 0), 0) || 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new VoucherService()