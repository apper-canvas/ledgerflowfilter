import exchangeRatesData from "@/services/mockData/exchangeRates.json"
import currencyService from "@/services/api/currencyService"

class ExchangeRateService {
  constructor() {
    this.data = [...exchangeRatesData]
  }

  async getAll() {
    await this.delay(250)
    return [...this.data].sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(r => r.Id === parseInt(id))
    if (!item) {
      throw new Error("Exchange rate not found")
    }
    return { ...item }
  }

  async getRatesByDateRange(fromDate, toDate) {
    await this.delay(300)
    return this.data.filter(rate => {
      const rateDate = new Date(rate.date)
      const start = new Date(fromDate)
      const end = new Date(toDate)
      return rateDate >= start && rateDate <= end
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  async getLatestRates() {
    await this.delay(200)
    const rateMap = new Map()
    
    // Sort by date descending to get latest rates first
    const sortedRates = [...this.data].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Get the most recent rate for each currency pair
    for (const rate of sortedRates) {
      const key = `${rate.fromCurrency}-${rate.toCurrency}`
      if (!rateMap.has(key)) {
        rateMap.set(key, rate)
      }
    }
    
    return Array.from(rateMap.values())
  }

  async getRateForCurrencyPair(fromCurrency, toCurrency, date = null) {
    await this.delay(200)
    
    let filteredRates = this.data.filter(rate => 
      rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    )
    
    if (date) {
      // Find rate for specific date or closest previous date
      const targetDate = new Date(date)
      filteredRates = filteredRates.filter(rate => new Date(rate.date) <= targetDate)
    }
    
    if (filteredRates.length === 0) {
      return null
    }
    
    // Return the most recent rate
    const latestRate = filteredRates.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    return { ...latestRate }
  }

  async create(exchangeRate) {
    await this.delay(300)
    
    // Validate currencies exist
    try {
      await currencyService.getByCode(exchangeRate.fromCurrency)
      await currencyService.getByCode(exchangeRate.toCurrency)
    } catch (error) {
      throw new Error("Invalid currency code")
    }
    
    if (exchangeRate.fromCurrency === exchangeRate.toCurrency) {
      throw new Error("From and To currencies cannot be the same")
    }
    
    if (!exchangeRate.rate || exchangeRate.rate <= 0) {
      throw new Error("Exchange rate must be greater than zero")
    }
    
    if (!exchangeRate.date) {
      throw new Error("Date is required")
    }

    const newId = Math.max(...this.data.map(r => r.Id)) + 1
    const newRate = {
      ...exchangeRate,
      Id: newId,
      rate: parseFloat(exchangeRate.rate),
      createdAt: new Date().toISOString(),
      createdBy: "User"
    }
    
    this.data.push(newRate)
    return { ...newRate }
  }

  async update(id, exchangeRate) {
    await this.delay(300)
    const index = this.data.findIndex(r => r.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Exchange rate not found")
    }
    
    // Validate currencies exist
    try {
      await currencyService.getByCode(exchangeRate.fromCurrency)
      await currencyService.getByCode(exchangeRate.toCurrency)
    } catch (error) {
      throw new Error("Invalid currency code")
    }
    
    if (exchangeRate.fromCurrency === exchangeRate.toCurrency) {
      throw new Error("From and To currencies cannot be the same")
    }
    
    if (!exchangeRate.rate || exchangeRate.rate <= 0) {
      throw new Error("Exchange rate must be greater than zero")
    }

    const updatedRate = { 
      ...exchangeRate, 
      Id: parseInt(id),
      rate: parseFloat(exchangeRate.rate)
    }
    this.data[index] = updatedRate
    return { ...updatedRate }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(r => r.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Exchange rate not found")
    }
    this.data.splice(index, 1)
    return true
  }

  async convertAmount(amount, fromCurrency, toCurrency, date = null) {
    await this.delay(200)
    
    if (fromCurrency === toCurrency) {
      return amount
    }
    
    const rate = await this.getRateForCurrencyPair(fromCurrency, toCurrency, date)
    if (!rate) {
      throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
    }
    
    return amount * rate.rate
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new ExchangeRateService()