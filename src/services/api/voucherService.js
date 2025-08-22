import vouchersData from "@/services/mockData/vouchers.json"

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
    return { ...newVoucher }
  }

  async update(id, voucher) {
    await this.delay(400)
    const index = this.data.findIndex(v => v.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Voucher not found")
    }
const updatedVoucher = { ...voucher, Id: parseInt(id), customFields: voucher.customFields || {} }
    this.data[index] = updatedVoucher
    return { ...updatedVoucher }
  }

  async delete(id) {
    await this.delay(300)
    const index = this.data.findIndex(v => v.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Voucher not found")
    }
    this.data.splice(index, 1)
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
              revenue += entry.amount || 0
            } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
              expenses += entry.amount || 0
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new VoucherService()