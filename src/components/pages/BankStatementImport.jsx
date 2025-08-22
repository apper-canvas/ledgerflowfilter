import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import FormField from "@/components/molecules/FormField"
import DataTable from "@/components/organisms/DataTable"
import bankStatementService from "@/services/api/bankStatementService"
import ledgerService from "@/services/api/ledgerService"
import { cn } from "@/utils/cn"

const BankStatementImport = () => {
  const [statements, setStatements] = useState([])
  const [ledgers, setLedgers] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selectedLedger, setSelectedLedger] = useState("")
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [matches, setMatches] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statementsData, ledgersData] = await Promise.all([
        bankStatementService.getAll(),
        ledgerService.getAll()
      ])
      setStatements(statementsData)
      setLedgers(ledgersData.filter(l => l.group === "Current Assets"))
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      toast.error("Please select a CSV or Excel file")
      return
    }

    setFile(selectedFile)
    parseFile(selectedFile)
  }

  const parseFile = async (file) => {
    setLoading(true)
    try {
      const data = await bankStatementService.parseFile(file)
      setPreviewData(data)
      setShowPreview(true)
      toast.success(`Parsed ${data.length} transactions`)
    } catch (error) {
      toast.error("Failed to parse file: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedLedger) {
      toast.error("Please select a bank account")
      return
    }

    if (previewData.length === 0) {
      toast.error("No data to import")
      return
    }

    setImporting(true)
    try {
      const importResult = await bankStatementService.importStatements(
        previewData,
        parseInt(selectedLedger)
      )
      
      // Find potential matches
      const matchResults = await bankStatementService.findMatches(importResult)
      setMatches(matchResults)
      
      await loadData()
      setShowPreview(false)
      setFile(null)
      setPreviewData([])
      toast.success(`Imported ${importResult.length} statements with ${Object.keys(matchResults).length} potential matches`)
    } catch (error) {
      toast.error("Import failed: " + error.message)
    } finally {
      setImporting(false)
    }
  }

  const handleConfirmMatch = async (statementId, voucherId) => {
    try {
      await bankStatementService.confirmMatch(statementId, voucherId)
      await loadData()
      toast.success("Match confirmed successfully")
    } catch (error) {
      toast.error("Failed to confirm match")
    }
  }

  const handleRejectMatch = async (statementId) => {
    try {
      await bankStatementService.rejectMatch(statementId)
      await loadData()
      toast.success("Match rejected")
    } catch (error) {
      toast.error("Failed to reject match")
    }
  }

  const handleDelete = async (statement) => {
    if (!window.confirm("Are you sure you want to delete this statement?")) return
    
    try {
      await bankStatementService.delete(statement.Id)
      await loadData()
      toast.success("Statement deleted successfully")
    } catch (error) {
      toast.error("Failed to delete statement")
    }
  }

  const getMatchAccuracy = (accuracy) => {
    if (accuracy >= 80) return { label: "High", color: "bg-green-100 text-green-800" }
    if (accuracy >= 60) return { label: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Low", color: "bg-red-100 text-red-800" }
  }

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (value) => (
        <span className={value > 0 ? "text-green-600" : "text-red-600"}>
          ₹{Math.abs(value).toLocaleString()}
        </span>
      )
    },
    {
      key: "balance",
      label: "Balance",
      render: (value) => `₹${value.toLocaleString()}`
    },
    {
      key: "matchStatus",
      label: "Match Status",
      render: (value, row) => {
        if (value === "matched") {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Matched</span>
        }
        if (value === "potential") {
          const match = matches[row.Id]
          if (match) {
            const { label, color } = getMatchAccuracy(match.accuracy)
            return (
              <div className="flex items-center space-x-2">
                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", color)}>
                  {label} ({match.accuracy}%)
                </span>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleConfirmMatch(row.Id, match.voucherId)}
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                  >
                    <ApperIcon name="Check" className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRejectMatch(row.Id)}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="X" className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          }
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unmatched</span>
      }
    },
    {
      key: "ledgerName",
      label: "Account",
      render: (value) => value || "Unknown"
    }
  ]

  const previewColumns = [
    { key: "date", label: "Date", render: (value) => new Date(value).toLocaleDateString() },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (value) => `₹${value.toLocaleString()}` },
    { key: "balance", label: "Balance", render: (value) => `₹${value.toLocaleString()}` }
  ]

  if (loading && statements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading bank statements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <ApperIcon name="Upload" className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Statement Import</h1>
            <p className="text-gray-600 mt-1">Import and match bank statements with existing vouchers</p>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ApperIcon name="FileSpreadsheet" className="w-5 h-5 mr-2" />
            Import Bank Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Bank Account"
              type="select"
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              options={[
                { value: "", label: "Select bank account" },
                ...ledgers.map(ledger => ({
                  value: ledger.Id.toString(),
                  label: ledger.name
                }))
              ]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statement File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 mt-1">Supports CSV, Excel (.xlsx, .xls) formats</p>
            </div>
          </div>

          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ApperIcon name="FileText" className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Selected: {file.name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Eye" className="w-5 h-5 mr-2" />
                Preview Data ({previewData.length} transactions)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false)
                    setFile(null)
                    setPreviewData([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || !selectedLedger}
                >
                  {importing ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                      Import & Match
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={previewData}
              columns={previewColumns}
              className="max-h-96 overflow-y-auto"
            />
          </CardContent>
        </Card>
      )}

      {/* Statements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ApperIcon name="List" className="w-5 h-5 mr-2" />
            Imported Statements ({statements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statements.length > 0 ? (
            <DataTable
              data={statements}
              columns={columns}
              onDelete={handleDelete}
            />
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="FileX" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bank statements imported yet</p>
              <p className="text-sm text-gray-400 mt-1">Import your first statement to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">
            <ApperIcon name="HelpCircle" className="w-4 h-4 mr-2 inline" />
            How Statement Matching Works
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-800">
            <div>
              <strong>Amount Match (40%)</strong>
              <p>Exact amount matching with vouchers</p>
            </div>
            <div>
              <strong>Date Proximity (30%)</strong>
              <p>Within 3 days of voucher date</p>
            </div>
            <div>
              <strong>Description (30%)</strong>
              <p>Text similarity with narration</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">High: 80%+ match</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Medium: 60-79% match</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">Low: &lt;60% match</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BankStatementImport