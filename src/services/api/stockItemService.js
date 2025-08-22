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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new StockItemService()