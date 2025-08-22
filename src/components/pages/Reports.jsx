import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import VoucherDetails from "@/components/pages/VoucherDetails";
import ledgerService from "@/services/api/ledgerService";
import voucherService from "@/services/api/voucherService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
const Reports = () => {
  const { type } = useParams()
  const currentReport = type || "trial-balance"
const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [selectedVouchers, setSelectedVouchers] = useState([])
  const [modalTitle, setModalTitle] = useState("")
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().getFullYear(), 3, 1).toISOString().split("T")[0], // Financial year start
    toDate: new Date().toISOString().split("T")[0],
    ledgerId: ""
  })

  const reports = [
  const reports = [
    { key: "trial-balance", label: "Trial Balance", icon: "Scale" },
    { key: "profit-loss", label: "P&L Statement", icon: "TrendingUp" },
    { key: "balance-sheet", label: "Balance Sheet", icon: "FileBarChart" },
    { key: "ledger", label: "Ledger Report", icon: "BookOpen" },
    { key: "daybook", label: "Day Book", icon: "Calendar" }
  ]

  useEffect(() => {
    if (currentReport) {
      generateReport()
    }
  }, [currentReport])

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const vouchers = await voucherService.getAll()
      const ledgers = await ledgerService.getAll()
      
      let reportData = []
      
      switch (currentReport) {
        case "trial-balance":
          reportData = generateTrialBalance(vouchers, ledgers)
          break
        case "profit-loss":
          reportData = generateProfitLoss(vouchers, ledgers)
          break
        case "balance-sheet":
          reportData = generateBalanceSheet(vouchers, ledgers)
          break
        case "ledger":
          reportData = generateLedgerReport(vouchers, ledgers, filters.ledgerId)
          break
        case "daybook":
          reportData = generateDayBook(vouchers)
          break
        default:
          reportData = []
      }
      
      setData(reportData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

const handleDrillDown = async (ledgerId, ledgerName) => {
    try {
      setLoading(true)
      const vouchers = await voucherService.getByLedgerAndDate(
        ledgerId, 
        filters.fromDate, 
        filters.toDate
      )
      setSelectedVouchers(vouchers)
      setModalTitle(`Vouchers for ${ledgerName}`)
      setShowVoucherModal(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVoucherDrillDown = async (voucherId) => {
    try {
      setLoading(true)
      const voucher = await voucherService.getById(voucherId)
      setSelectedVouchers([voucher])
      setModalTitle(`Voucher Details`)
      setShowVoucherModal(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateTrialBalance = (vouchers, ledgers) => {
    const balances = {}
    
    // Initialize with opening balances
    ledgers.forEach(ledger => {
      balances[ledger.Id] = {
        id: ledger.Id,
        name: ledger.name,
        group: ledger.group,
        debit: ledger.openingBalance > 0 ? ledger.openingBalance : 0,
        credit: ledger.openingBalance < 0 ? Math.abs(ledger.openingBalance) : 0
      }
    })
    
    // Process voucher entries
    vouchers.forEach(voucher => {
      if (voucher.entries) {
        voucher.entries.forEach(entry => {
          const ledgerId = entry.ledgerId
          if (!balances[ledgerId]) {
            const ledger = ledgers.find(l => l.Id === ledgerId)
            if (ledger) {
              balances[ledgerId] = {
                id: ledger.Id,
                name: ledger.name,
                group: ledger.group,
                debit: 0,
                credit: 0
              }
            }
          }
          
          if (balances[ledgerId]) {
            if (entry.type === "dr") {
              balances[ledgerId].debit += entry.amount
            } else {
              balances[ledgerId].credit += entry.amount
            }
          }
        })
      }
    })
    
    return Object.values(balances).filter(balance => 
      balance.debit !== 0 || balance.credit !== 0
    )
  }

  const generateProfitLoss = (vouchers, ledgers) => {
    const incomeExpenses = {
      income: [],
      expenses: [],
      totalIncome: 0,
      totalExpenses: 0
    }
    
    const trialBalance = generateTrialBalance(vouchers, ledgers)
    
    trialBalance.forEach(item => {
      if (item.group === "Income" || item.group === "Sales") {
        incomeExpenses.income.push(item)
        incomeExpenses.totalIncome += item.credit - item.debit
      } else if (item.group === "Expenses" || item.group === "Cost of Goods Sold") {
        incomeExpenses.expenses.push(item)
        incomeExpenses.totalExpenses += item.debit - item.credit
      }
    })
    
    return [incomeExpenses]
  }

  const generateBalanceSheet = (vouchers, ledgers) => {
    const balanceSheet = {
      assets: [],
      liabilities: [],
      totalAssets: 0,
      totalLiabilities: 0
    }
    
    const trialBalance = generateTrialBalance(vouchers, ledgers)
    
    trialBalance.forEach(item => {
      if (item.group === "Assets" || item.group === "Current Assets" || item.group === "Fixed Assets") {
        balanceSheet.assets.push(item)
        balanceSheet.totalAssets += item.debit - item.credit
      } else if (item.group === "Liabilities" || item.group === "Current Liabilities" || item.group === "Capital") {
        balanceSheet.liabilities.push(item)
        balanceSheet.totalLiabilities += item.credit - item.debit
      }
    })
    
    return [balanceSheet]
  }

  const generateLedgerReport = (vouchers, ledgers, ledgerId) => {
    if (!ledgerId) return []
    
    const ledger = ledgers.find(l => l.Id === parseInt(ledgerId))
    if (!ledger) return []
    
    const transactions = []
    let balance = ledger.openingBalance || 0
    
    transactions.push({
      date: filters.fromDate,
      particular: "Opening Balance",
      voucherType: "",
      voucherNo: "",
      debit: balance > 0 ? balance : 0,
      credit: balance < 0 ? Math.abs(balance) : 0,
      balance: Math.abs(balance)
    })
    
    vouchers
      .filter(v => new Date(v.date) >= new Date(filters.fromDate) && 
                   new Date(v.date) <= new Date(filters.toDate))
      .forEach(voucher => {
        const entry = voucher.entries?.find(e => e.ledgerId === parseInt(ledgerId))
        if (entry) {
          balance += entry.type === "dr" ? entry.amount : -entry.amount
          
          transactions.push({
            date: voucher.date,
            particular: voucher.narration || "Transaction",
            voucherType: voucher.type,
            voucherNo: voucher.number,
            debit: entry.type === "dr" ? entry.amount : 0,
            credit: entry.type === "cr" ? entry.amount : 0,
            balance: Math.abs(balance)
          })
        }
      })
    
    return transactions
  }

const generateDayBook = (vouchers) => {
    return vouchers
      .filter(v => new Date(v.date) >= new Date(filters.fromDate) && 
                   new Date(v.date) <= new Date(filters.toDate))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(voucher => ({
        id: voucher.Id,
        date: voucher.date,
        type: voucher.type,
        number: voucher.number,
        narration: voucher.narration,
        amount: voucher.entries?.reduce((sum, entry) => 
          sum + (entry.type === "dr" ? entry.amount : 0), 0) || 0
      }))
  }

  const currentReportInfo = reports.find(r => r.key === currentReport)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="BarChart3" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Financial reports and analysis</p>
          </div>
        </div>
        
        <Button onClick={() => window.print()}>
          <ApperIcon name="Printer" className="w-4 h-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Report Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1">
            {reports.map((report) => (
              <Button
                key={report.key}
                variant={currentReport === report.key ? "default" : "ghost"}
                onClick={() => window.location.href = `/reports/${report.key}`}
                className="flex items-center"
              >
                <ApperIcon name={report.icon} className="w-4 h-4 mr-2" />
                {report.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ApperIcon name={currentReportInfo?.icon || "FileBarChart"} className="w-5 h-5 mr-2" />
            {currentReportInfo?.label || "Report"}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormField
              label="From Date"
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
            />
            
            <FormField
              label="To Date"
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({...filters, toDate: e.target.value})}
            />
            
            {currentReport === "ledger" && (
              <FormField
                label="Select Ledger"
                type="select"
                value={filters.ledgerId}
                onChange={(e) => setFilters({...filters, ledgerId: e.target.value})}
                options={[
                  { value: "", label: "Select Ledger" },
                  { value: "1", label: "Cash" },
                  { value: "2", label: "Bank" },
                  { value: "3", label: "Sales" }
                ]}
              />
            )}
            
            <div className="flex items-end">
              <Button onClick={generateReport}>
                <ApperIcon name="Play" className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <Loading rows={6} />
          ) : error ? (
            <Error message={error} onRetry={generateReport} />
          ) : (
            <div className="report-content">
              {currentReport === "trial-balance" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Trial Balance</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    From {new Date(filters.fromDate).toLocaleDateString()} to {new Date(filters.toDate).toLocaleDateString()}
                  </p>
                  
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Ledger Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Group</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Debit (₹)</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
<tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.group}</td>
                          <td 
                            className="border border-gray-300 px-4 py-2 text-right clickable-amount" 
                            onClick={() => item.debit > 0 && handleDrillDown(item.id, item.name)}
                          >
                            {item.debit > 0 ? item.debit.toFixed(2) : "-"}
                          </td>
                          <td 
                            className="border border-gray-300 px-4 py-2 text-right clickable-amount"
                            onClick={() => item.credit > 0 && handleDrillDown(item.id, item.name)}
                          >
                            {item.credit > 0 ? item.credit.toFixed(2) : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-medium">
                        <td className="border border-gray-300 px-4 py-2" colSpan={2}>Total</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {data.reduce((sum, item) => sum + item.debit, 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {data.reduce((sum, item) => sum + item.credit, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {currentReport === "daybook" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Day Book</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    From {new Date(filters.fromDate).toLocaleDateString()} to {new Date(filters.toDate).toLocaleDateString()}
                  </p>
                  
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Number</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Narration</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
<tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 capitalize">{item.type}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.number}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.narration}</td>
                          <td 
                            className="border border-gray-300 px-4 py-2 text-right clickable-amount"
                            onClick={() => handleVoucherDrillDown(item.id)}
                          >
                            {item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <ApperIcon name="FileX" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No data found</h3>
                  <p>Try adjusting your date range or filters</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
</CardContent>
      </Card>

      {/* Voucher Details Modal */}
      {showVoucherModal && (
        <VoucherDetails
          vouchers={selectedVouchers}
          title={modalTitle}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </div>
  )

export default Reports