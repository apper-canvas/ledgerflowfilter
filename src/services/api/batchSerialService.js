import batchSerialData from "@/services/mockData/batchSerial.json"

class BatchSerialService {
  constructor() {
    this.data = [...batchSerialData]
  }

  async getAll() {
    await this.delay(250)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(b => b.Id === parseInt(id))
    if (!item) {
      throw new Error("Batch/Serial not found")
    }
    return { ...item }
  }

  async getByStockItemId(stockItemId) {
    await this.delay(200)
    return this.data.filter(b => b.stockItemId === parseInt(stockItemId))
  }

  async create(batchSerial) {
    await this.delay(300)
    const newId = Math.max(...this.data.map(b => b.Id), 0) + 1
    const newBatchSerial = {
      ...batchSerial,
      Id: newId,
      createdDate: new Date().toISOString().split("T")[0]
    }
    this.data.push(newBatchSerial)
    return { ...newBatchSerial }
  }

  async update(id, batchSerial) {
    await this.delay(300)
    const index = this.data.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Batch/Serial not found")
    }
    const updatedBatchSerial = { ...batchSerial, Id: parseInt(id) }
    this.data[index] = updatedBatchSerial
    return { ...updatedBatchSerial }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Batch/Serial not found")
    }
    this.data.splice(index, 1)
    return true
  }

  async generateBatchNumber(stockItemId, prefix = "B") {
    const existing = await this.getByStockItemId(stockItemId)
    const batchNumbers = existing
      .filter(b => b.type === "batch")
      .map(b => b.number)
      .filter(n => n.startsWith(prefix))
    
    let nextNumber = 1
    if (batchNumbers.length > 0) {
      const numbers = batchNumbers
        .map(n => parseInt(n.replace(prefix, "")))
        .filter(n => !isNaN(n))
      nextNumber = Math.max(...numbers) + 1
    }
    
    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
  }

  async generateSerialNumber(stockItemId, prefix = "S") {
    const existing = await this.getByStockItemId(stockItemId)
    const serialNumbers = existing
      .filter(b => b.type === "serial")
      .map(b => b.number)
      .filter(n => n.startsWith(prefix))
    
    let nextNumber = 1
    if (serialNumbers.length > 0) {
      const numbers = serialNumbers
        .map(n => parseInt(n.replace(prefix, "")))
        .filter(n => !isNaN(n))
      nextNumber = Math.max(...numbers) + 1
    }
    
    return `${prefix}${nextNumber.toString().padStart(6, "0")}`
  }
async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(item =>
        item.number.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.stockItemId) {
      results = results.filter(item => item.stockItemId === parseInt(filters.stockItemId))
    }
    
    if (filters.type && filters.type !== 'all') {
      results = results.filter(item => item.type === filters.type)
    }
    
    if (filters.status && filters.status !== 'all') {
      results = results.filter(item => item.status === filters.status)
    }
    
    if (filters.location && filters.location !== 'all') {
      results = results.filter(item => item.location === filters.location)
    }
    
    if (filters.expiryStatus) {
      const today = new Date()
      results = results.filter(item => {
        if (!item.expiryDate) return filters.expiryStatus === 'no-expiry'
        
        const expiry = new Date(item.expiryDate)
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
        
        switch (filters.expiryStatus) {
          case 'expired': return daysUntilExpiry < 0
          case 'expiring': return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
          case 'valid': return daysUntilExpiry > 30
          default: return true
        }
      })
    }
    
    return results
  }

  async getByLocation(location) {
    await this.delay(200)
    return this.data.filter(item => item.location === location)
  }

  async getExpiringItems(days = 30) {
    await this.delay(200)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    return this.data.filter(item => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= futureDate && expiryDate >= new Date()
    })
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new BatchSerialService()