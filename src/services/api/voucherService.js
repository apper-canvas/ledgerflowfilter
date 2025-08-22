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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new VoucherService()