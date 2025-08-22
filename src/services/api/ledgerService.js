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
const updatedLedger = { ...ledger, Id: parseInt(id), customFields: ledger.customFields || {} }
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new LedgerService()