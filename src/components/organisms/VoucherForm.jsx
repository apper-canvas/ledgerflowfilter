import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import FormField from "@/components/molecules/FormField"
import Button from "@/components/atoms/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import voucherService from "@/services/api/voucherService"
import ledgerService from "@/services/api/ledgerService"
import stockItemService from "@/services/api/stockItemService"

const VoucherForm = ({ type = "journal", voucherId = null, onSave }) => {
  const [voucher, setVoucher] = useState({
    type,
    number: "",
    date: new Date().toISOString().split("T")[0],
    narration: "",
    entries: [
      { ledgerId: "", amount: 0, type: "dr", stockDetails: null },
      { ledgerId: "", amount: 0, type: "cr", stockDetails: null }
    ],
    gstDetails: {
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0
    }
  })

  const [ledgers, setLedgers] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
    if (voucherId) {
      loadVoucher(voucherId)
    } else {
      generateVoucherNumber()
    }
  }, [type, voucherId])

  const loadData = async () => {
    try {
      const [ledgersData, stockData] = await Promise.all([
        ledgerService.getAll(),
        stockItemService.getAll()
      ])
      setLedgers(ledgersData)
      setStockItems(stockData)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const loadVoucher = async (id) => {
    try {
      const data = await voucherService.getById(id)
      setVoucher(data)
    } catch (error) {
      toast.error("Failed to load voucher")
    }
  }

  const generateVoucherNumber = async () => {
    try {
      const vouchers = await voucherService.getAll()
      const typeVouchers = vouchers.filter(v => v.type === type)
      const lastNumber = typeVouchers.length > 0 
        ? Math.max(...typeVouchers.map(v => parseInt(v.number) || 0))
        : 0
      
      setVoucher(prev => ({
        ...prev,
        number: (lastNumber + 1).toString().padStart(4, "0")
      }))
    } catch (error) {
      console.error("Failed to generate voucher number:", error)
    }
  }

  const addEntry = () => {
    setVoucher(prev => ({
      ...prev,
      entries: [...prev.entries, { ledgerId: "", amount: 0, type: "dr", stockDetails: null }]
    }))
  }

  const removeEntry = (index) => {
    if (voucher.entries.length > 2) {
      setVoucher(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }))
    }
  }

  const updateEntry = (index, field, value) => {
    setVoucher(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }))
  }

  const calculateGST = () => {
    const taxableAmount = voucher.entries.reduce((sum, entry) => {
      if (entry.type === "dr" && entry.ledgerId) {
        const ledger = ledgers.find(l => l.Id === parseInt(entry.ledgerId))
        if (ledger?.gstApplicable) {
          return sum + parseFloat(entry.amount || 0)
        }
      }
      return sum
    }, 0)

    const gstRate = 18 // Default GST rate
    const cgst = (taxableAmount * gstRate) / 200
    const sgst = (taxableAmount * gstRate) / 200
    const totalTax = cgst + sgst

    setVoucher(prev => ({
      ...prev,
      gstDetails: {
        cgst,
        sgst,
        igst: 0,
        totalTax
      }
    }))
  }

  const getTotalDebit = () => {
    return voucher.entries
      .filter(entry => entry.type === "dr")
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
  }

  const getTotalCredit = () => {
    return voucher.entries
      .filter(entry => entry.type === "cr")
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
  }

  const handleSave = async () => {
    const totalDebit = getTotalDebit()
    const totalCredit = getTotalCredit()

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error("Debit and Credit totals must match")
      return
    }

    if (voucher.entries.some(entry => !entry.ledgerId || entry.amount <= 0)) {
      toast.error("All entries must have a ledger and amount")
      return
    }

    setSaving(true)
    try {
      const voucherData = {
        ...voucher,
        entries: voucher.entries.map(entry => ({
          ...entry,
          ledgerId: parseInt(entry.ledgerId),
          amount: parseFloat(entry.amount)
        }))
      }

      if (voucherId) {
        await voucherService.update(voucherId, voucherData)
        toast.success("Voucher updated successfully")
      } else {
        await voucherService.create(voucherData)
        toast.success("Voucher saved successfully")
      }

      if (onSave) onSave()
      
      // Reset form for new entry
      if (!voucherId) {
        setVoucher({
          type,
          number: "",
          date: new Date().toISOString().split("T")[0],
          narration: "",
          entries: [
            { ledgerId: "", amount: 0, type: "dr", stockDetails: null },
            { ledgerId: "", amount: 0, type: "cr", stockDetails: null }
          ],
          gstDetails: { cgst: 0, sgst: 0, igst: 0, totalTax: 0 }
        })
        generateVoucherNumber()
      }
    } catch (error) {
      toast.error("Failed to save voucher")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{type} Voucher</span>
          <div className="flex items-center space-x-2 text-sm">
            <span>No: {voucher.number}</span>
            <span className="kbd">F2</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Voucher Type"
            type="select"
            value={voucher.type}
            onChange={(e) => setVoucher(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: "sales", label: "Sales" },
              { value: "purchase", label: "Purchase" },
              { value: "payment", label: "Payment" },
              { value: "receipt", label: "Receipt" },
              { value: "contra", label: "Contra" },
              { value: "journal", label: "Journal" }
            ]}
          />
          
          <FormField
            label="Voucher No"
            value={voucher.number}
            onChange={(e) => setVoucher(prev => ({ ...prev, number: e.target.value }))}
          />
          
          <FormField
            label="Date"
            type="date"
            value={voucher.date}
            onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        <div className="voucher-entry">
          <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-700 border-b pb-2">
            <div className="col-span-4">Ledger</div>
            <div className="col-span-2">Debit</div>
            <div className="col-span-2">Credit</div>
            <div className="col-span-3">Narration</div>
            <div className="col-span-1">Action</div>
          </div>

          {voucher.entries.map((entry, index) => (
            <div key={index} className="form-row grid grid-cols-12 gap-2 py-2">
              <div className="col-span-4">
                <select
                  value={entry.ledgerId}
                  onChange={(e) => updateEntry(index, "ledgerId", e.target.value)}
                  className="w-full border-none bg-transparent focus:bg-white focus:shadow-sm"
                >
                  <option value="">Select Ledger</option>
                  {ledgers.map(ledger => (
                    <option key={ledger.Id} value={ledger.Id}>
                      {ledger.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <input
                  type="number"
                  value={entry.type === "dr" ? entry.amount : ""}
                  onChange={(e) => {
                    updateEntry(index, "amount", parseFloat(e.target.value) || 0)
                    updateEntry(index, "type", "dr")
                  }}
                  className="w-full border-none bg-transparent focus:bg-white focus:shadow-sm text-right"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <input
                  type="number"
                  value={entry.type === "cr" ? entry.amount : ""}
                  onChange={(e) => {
                    updateEntry(index, "amount", parseFloat(e.target.value) || 0)
                    updateEntry(index, "type", "cr")
                  }}
                  className="w-full border-none bg-transparent focus:bg-white focus:shadow-sm text-right"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Entry narration"
                  className="w-full border-none bg-transparent focus:bg-white focus:shadow-sm"
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(index)}
                  disabled={voucher.entries.length <= 2}
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-2">
            <div className="grid grid-cols-12 gap-2 font-medium">
              <div className="col-span-4">Total</div>
              <div className="col-span-2 text-right">₹{getTotalDebit().toFixed(2)}</div>
              <div className="col-span-2 text-right">₹{getTotalCredit().toFixed(2)}</div>
              <div className="col-span-4"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={addEntry}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
          
          <Button type="button" variant="outline" onClick={calculateGST}>
            Calculate GST
          </Button>
        </div>

        {voucher.gstDetails.totalTax > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">GST Details</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>CGST: ₹{voucher.gstDetails.cgst.toFixed(2)}</div>
              <div>SGST: ₹{voucher.gstDetails.sgst.toFixed(2)}</div>
              <div>IGST: ₹{voucher.gstDetails.igst.toFixed(2)}</div>
              <div className="font-medium">Total Tax: ₹{voucher.gstDetails.totalTax.toFixed(2)}</div>
            </div>
          </div>
        )}

        <FormField
          label="Narration"
          type="textarea"
          value={voucher.narration}
          onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
          placeholder="Enter voucher narration..."
          className="min-h-[80px]"
        />

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-600">
            Difference: ₹{Math.abs(getTotalDebit() - getTotalCredit()).toFixed(2)}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" disabled={saving}>
              Save as Draft
            </Button>
            
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  Save Voucher
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VoucherForm