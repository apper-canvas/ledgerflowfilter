import stockItemsData from "@/services/mockData/stockItems.json"

class StockItemService {
  constructor() {
    this.data = [...stockItemsData]
  }

  async getAll() {
    await this.delay(250)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(s => s.Id === parseInt(id))
    if (!item) {
      throw new Error("Stock item not found")
    }
    return { ...item }
  }

  async create(stockItem) {
    await this.delay(300)
    const newId = Math.max(...this.data.map(s => s.Id)) + 1
    const newStockItem = {
      ...stockItem,
      Id: newId
    }
    this.data.push(newStockItem)
    return { ...newStockItem }
  }

  async update(id, stockItem) {
    await this.delay(300)
    const index = this.data.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Stock item not found")
    }
    const updatedStockItem = { ...stockItem, Id: parseInt(id) }
    this.data[index] = updatedStockItem
    return { ...updatedStockItem }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Stock item not found")
    }
    this.data.splice(index, 1)
    return true
  }
async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.hsnCode?.includes(searchTerm) ||
        item.unit?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.unit && filters.unit !== 'all') {
      results = results.filter(item => item.unit === filters.unit)
    }
    
    if (filters.gstRate && filters.gstRate !== 'all') {
      results = results.filter(item => item.gstRate === parseFloat(filters.gstRate))
    }
    
    if (filters.stockValue) {
      const { min, max } = filters.stockValue
      results = results.filter(item => {
        const value = item.openingStock?.value || 0
        return (!min || value >= min) && (!max || value <= max)
      })
    }
    
    return results
  }

  async getByCategory(category) {
    await this.delay(200)
    return this.data.filter(item => item.category === category)
  }

  async getLowStockItems(threshold = 10) {
    await this.delay(200)
    return this.data.filter(item => 
      (item.openingStock?.quantity || 0) <= threshold
    )
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new StockItemService()