import currenciesData from "@/services/mockData/currencies.json"

class CurrencyService {
  constructor() {
    this.data = [...currenciesData]
  }

  async getAll() {
    await this.delay(250)
    return [...this.data]
  }

  async getActive() {
    await this.delay(200)
    return this.data.filter(c => c.isActive)
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(c => c.Id === parseInt(id))
    if (!item) {
      throw new Error("Currency not found")
    }
    return { ...item }
  }

  async getByCode(code) {
    await this.delay(200)
    const item = this.data.find(c => c.code === code.toUpperCase())
    if (!item) {
      throw new Error("Currency not found")
    }
    return { ...item }
  }

  async getBaseCurrency() {
    await this.delay(150)
    const baseCurrency = this.data.find(c => c.isBaseCurrency)
    return baseCurrency ? { ...baseCurrency } : null
  }

  async create(currency) {
    await this.delay(300)
    
    // Check for duplicate code
    if (this.data.some(c => c.code.toLowerCase() === currency.code.toLowerCase())) {
      throw new Error("Currency code already exists")
    }

    const newId = Math.max(...this.data.map(c => c.Id)) + 1
    const newCurrency = {
      ...currency,
      Id: newId,
      code: currency.code.toUpperCase(),
      isBaseCurrency: false,
      isActive: currency.isActive !== false
    }
    
    this.data.push(newCurrency)
    return { ...newCurrency }
  }

  async update(id, currency) {
    await this.delay(300)
    const index = this.data.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Currency not found")
    }

    // Check for duplicate code (excluding current currency)
    const existingCurrency = this.data.find(c => 
      c.code.toLowerCase() === currency.code.toLowerCase() && c.Id !== parseInt(id)
    )
    if (existingCurrency) {
      throw new Error("Currency code already exists")
    }

    const updatedCurrency = { 
      ...currency, 
      Id: parseInt(id),
      code: currency.code.toUpperCase(),
      isBaseCurrency: this.data[index].isBaseCurrency // Preserve base currency status
    }
    this.data[index] = updatedCurrency
    return { ...updatedCurrency }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Currency not found")
    }

    const currency = this.data[index]
    if (currency.isBaseCurrency) {
      throw new Error("Cannot delete base currency")
    }

    this.data.splice(index, 1)
    return true
  }

  async setBaseCurrency(id) {
    await this.delay(300)
    const currency = this.data.find(c => c.Id === parseInt(id))
    if (!currency) {
      throw new Error("Currency not found")
    }

    // Remove base currency status from all currencies
    this.data.forEach(c => c.isBaseCurrency = false)
    
    // Set new base currency
    currency.isBaseCurrency = true
    return { ...currency }
  }
async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(currency =>
        currency.code.toLowerCase().includes(searchTerm) ||
        currency.name.toLowerCase().includes(searchTerm) ||
        currency.symbol?.includes(searchTerm)
      )
    }
    
    if (filters.isActive !== undefined) {
      results = results.filter(currency => currency.isActive === filters.isActive)
    }
    
    if (filters.isBaseCurrency !== undefined) {
      results = results.filter(currency => currency.isBaseCurrency === filters.isBaseCurrency)
    }
    
    return results
  }

  async getByRegion(region) {
    await this.delay(200)
    // This would be implemented based on currency regions
    return this.data.filter(currency => currency.region === region)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new CurrencyService()