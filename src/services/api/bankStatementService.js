import bankStatementsData from "@/services/mockData/bankStatements.json"
import voucherService from "@/services/api/voucherService"
import ledgerService from "@/services/api/ledgerService"
import Papa from "papaparse"

class BankStatementService {
  constructor() {
    this.data = [...bankStatementsData]
  }

  async getAll() {
    await this.delay(250)
    // Enrich with ledger names
    const ledgers = await ledgerService.getAll()
    return this.data.map(statement => ({
      ...statement,
      ledgerName: ledgers.find(l => l.Id === statement.ledgerId)?.name || "Unknown"
    }))
  }

  async getById(id) {
    await this.delay(200)
    const item = this.data.find(s => s.Id === parseInt(id))
    if (!item) {
      throw new Error("Bank statement not found")
    }
    return { ...item }
  }

  async create(statement) {
    await this.delay(300)
    const newId = this.data.length > 0 ? Math.max(...this.data.map(s => s.Id)) + 1 : 1
    const newStatement = {
      ...statement,
      Id: newId,
      matchStatus: statement.matchStatus || "unmatched",
      matchedVoucherId: statement.matchedVoucherId || null,
      importDate: new Date().toISOString().split('T')[0]
    }
    this.data.push(newStatement)
    return { ...newStatement }
  }

  async update(id, statement) {
    await this.delay(300)
    const index = this.data.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Bank statement not found")
    }
    const updatedStatement = { ...statement, Id: parseInt(id) }
    this.data[index] = updatedStatement
    return { ...updatedStatement }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Bank statement not found")
    }
    this.data.splice(index, 1)
    return true
  }

  async parseFile(file) {
    await this.delay(500)
    
    return new Promise((resolve, reject) => {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            // Normalize common headers
            const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '')
            const mapping = {
              'date': 'date',
              'transactiondate': 'date',
              'valuedate': 'date',
              'description': 'description',
              'narration': 'description',
              'particulars': 'description',
              'details': 'description',
              'amount': 'amount',
              'debit': 'amount',
              'credit': 'amount',
              'balance': 'balance',
              'closingbalance': 'balance',
              'runningbalance': 'balance'
            }
            return mapping[normalized] || header
          },
          complete: (result) => {
            try {
              const processedData = this.processStatementData(result.data)
              resolve(processedData)
            } catch (error) {
              reject(error)
            }
          },
          error: (error) => {
            reject(new Error("CSV parsing failed: " + error.message))
          }
        })
      } else if (file.name.match(/\.(xlsx|xls)$/)) {
        // For Excel files, we'll simulate parsing
        // In a real app, you'd use a library like xlsx
        setTimeout(() => {
          const mockData = [
            {
              date: "2024-01-15",
              description: "ATM Withdrawal",
              amount: -5000,
              balance: 145000
            },
            {
              date: "2024-01-16", 
              description: "Salary Credit",
              amount: 50000,
              balance: 195000
            }
          ]
          resolve(mockData)
        }, 1000)
      } else {
        reject(new Error("Unsupported file format"))
      }
    })
  }

  processStatementData(rawData) {
    return rawData
      .filter(row => row.date && (row.amount || row.debit || row.credit))
      .map(row => {
        // Handle different amount formats
        let amount = 0
        if (row.amount) {
          amount = parseFloat(row.amount.toString().replace(/[^\d.-]/g, ''))
        } else if (row.debit && row.credit) {
          const debit = parseFloat(row.debit.toString().replace(/[^\d.-]/g, '') || 0)
          const credit = parseFloat(row.credit.toString().replace(/[^\d.-]/g, '') || 0)
          amount = credit - debit
        }

        // Parse date
        let date = new Date(row.date)
if (isNaN(date.getTime())) {
          // Try different date formats
          const parts = row.date.split(/[-/]/)
          if (parts.length === 3) {
            date = new Date(parts[2], parts[1] - 1, parts[0]) // DD/MM/YYYY
          }
        }

        return {
          date: date.toISOString().split('T')[0],
          description: (row.description || row.narration || row.particulars || "").trim(),
          amount,
          balance: parseFloat((row.balance || 0).toString().replace(/[^\d.-]/g, '')) || 0
        }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  async importStatements(statements, ledgerId) {
    await this.delay(1000)
    
    const importedStatements = []
    for (const stmt of statements) {
      const newStatement = await this.create({
        ...stmt,
        ledgerId,
        matchStatus: "unmatched",
        importDate: new Date().toISOString().split('T')[0]
      })
      importedStatements.push(newStatement)
    }
    
    return importedStatements
  }

  async findMatches(statements) {
    await this.delay(500)
    
    const vouchers = await voucherService.getAll()
    const matches = {}
    
    for (const statement of statements) {
      const potentialMatches = vouchers
        .map(voucher => ({
          voucher,
          accuracy: this.calculateMatchAccuracy(statement, voucher)
        }))
        .filter(match => match.accuracy >= 40) // Minimum 40% accuracy
        .sort((a, b) => b.accuracy - a.accuracy)
      
      if (potentialMatches.length > 0) {
        const bestMatch = potentialMatches[0]
        matches[statement.Id] = {
          voucherId: bestMatch.voucher.Id,
          accuracy: Math.round(bestMatch.accuracy),
          voucher: bestMatch.voucher
        }
        
        // Update statement status
        await this.update(statement.Id, {
          ...statement,
          matchStatus: "potential"
        })
      }
    }
    
    return matches
  }

  calculateMatchAccuracy(statement, voucher) {
    let accuracy = 0
    
    // Amount matching (40% weight)
    const stmtAmount = Math.abs(statement.amount)
    const voucherAmount = voucher.entries?.reduce((sum, entry) => {
      return entry.type === "dr" ? sum + entry.amount : sum - entry.amount
    }, 0) || 0
    
    const amountDiff = Math.abs(stmtAmount - Math.abs(voucherAmount))
    const amountAccuracy = Math.max(0, 100 - (amountDiff / stmtAmount) * 100)
    accuracy += (amountAccuracy * 0.4)
    
    // Date proximity (30% weight)
    const stmtDate = new Date(statement.date)
    const voucherDate = new Date(voucher.date)
    const daysDiff = Math.abs((stmtDate - voucherDate) / (1000 * 60 * 60 * 24))
    const dateAccuracy = Math.max(0, 100 - (daysDiff * 33.33)) // 3 days = 0%
    accuracy += (dateAccuracy * 0.3)
    
    // Description similarity (30% weight)
    const descAccuracy = this.calculateTextSimilarity(
      statement.description.toLowerCase(),
      (voucher.narration || "").toLowerCase()
    )
    accuracy += (descAccuracy * 0.3)
    
    return Math.min(100, accuracy)
  }

  calculateTextSimilarity(str1, str2) {
    if (!str1 || !str2) return 0
    
    const words1 = str1.split(/\s+/).filter(w => w.length > 2)
    const words2 = str2.split(/\s+/).filter(w => w.length > 2)
    
    if (words1.length === 0 && words2.length === 0) return 100
    if (words1.length === 0 || words2.length === 0) return 0
    
    let matches = 0
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++
          break
        }
      }
    }
    
    return (matches / Math.max(words1.length, words2.length)) * 100
  }

  async confirmMatch(statementId, voucherId) {
    await this.delay(300)
    
    const statement = await this.getById(statementId)
    await this.update(statementId, {
      ...statement,
      matchStatus: "matched",
      matchedVoucherId: voucherId
    })
    
    return true
  }

  async rejectMatch(statementId) {
    await this.delay(200)
    
    const statement = await this.getById(statementId)
    await this.update(statementId, {
      ...statement,
      matchStatus: "unmatched",
      matchedVoucherId: null
    })
    
    return true
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new BankStatementService()