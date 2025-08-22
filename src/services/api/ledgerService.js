import ledgersData from "@/services/mockData/ledgers.json"

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
    return { ...newLedger }
  }

  async update(id, ledger) {
    await this.delay(300)
    const index = this.data.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Ledger not found")
    }
const updatedLedger = { ...ledger, Id: parseInt(id), currency: ledger.currency || "INR", customFields: ledger.customFields || {} }
    this.data[index] = updatedLedger
    return { ...updatedLedger }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Ledger not found")
    }
    this.data.splice(index, 1)
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
      .reduce((sum, l) => sum + (l.currentBalance || 0), 0)
    
    const totalLiabilities = this.data
      .filter(l => l.group && l.group.toLowerCase().includes('liabil'))
      .reduce((sum, l) => sum + (l.currentBalance || 0), 0)
    
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
        const balance = ledger.currentBalance || 0
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new LedgerService()