import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import { toast } from "react-toastify"
import exchangeRateService from "@/services/api/exchangeRateService"
import currencyService from "@/services/api/currencyService"
import ApperIcon from "@/components/ApperIcon"
import DataTable from "@/components/organisms/DataTable"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import Loading from "@/components/ui/Loading"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"

const CurrencyRateManager = () => {
  const navigate = useNavigate()
  const [exchangeRates, setExchangeRates] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [baseCurrency, setBaseCurrency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingRate, setEditingRate] = useState(null)
  const [formData, setFormData] = useState({
    fromCurrency: "",
    toCurrency: "",
    rate: "",
    date: new Date().toISOString().split('T')[0]
  })
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [viewMode, setViewMode] = useState("latest") // latest, historical, all

  useEffect(() => {
    loadData()
    loadCurrencies()
  }, [viewMode, dateRange])

  const loadData = async () => {
    try {
      setError(null)
      let rates = []
      
      switch (viewMode) {
        case "latest":
          rates = await exchangeRateService.getLatestRates()
          break
        case "historical":
          rates = await exchangeRateService.getRatesByDateRange(dateRange.from, dateRange.to)
          break
        case "all":
          rates = await exchangeRateService.getAll()
          break
      }
      
      setExchangeRates(rates)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrencies = async () => {
    try {
      const currencyData = await currencyService.getActive()
      setCurrencies(currencyData)
      
      const base = await currencyService.getBaseCurrency()
      setBaseCurrency(base)
      
      // Set default toCurrency to base currency
      if (base && !formData.toCurrency) {
        setFormData(prev => ({ ...prev, toCurrency: base.code }))
      }
    } catch (err) {
      console.error("Failed to load currencies:", err)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.fromCurrency || !formData.toCurrency || !formData.rate || !formData.date) {
        toast.error("Please fill all required fields")
        return
      }

      if (parseFloat(formData.rate) <= 0) {
        toast.error("Exchange rate must be greater than zero")
        return
      }

      if (formData.fromCurrency === formData.toCurrency) {
        toast.error("From and To currencies cannot be the same")
        return
      }

      const dataToSave = {
        ...formData,
        rate: parseFloat(formData.rate)
      }

      if (editingRate) {
        await exchangeRateService.update(editingRate.Id, dataToSave)
        toast.success("Exchange rate updated successfully")
      } else {
        await exchangeRateService.create(dataToSave)
        toast.success("Exchange rate created successfully")
      }
      
      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message || "Failed to save exchange rate")
    }
  }

  const handleEdit = (rate) => {
    setEditingRate(rate)
    setFormData({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: rate.rate.toString(),
      date: rate.date
    })
    setShowForm(true)
  }

  const handleDelete = async (rate) => {
    if (!confirm("Are you sure you want to delete this exchange rate?")) {
      return
    }

    try {
      await exchangeRateService.delete(rate.Id)
      toast.success("Exchange rate deleted successfully")
      loadData()
    } catch (err) {
      toast.error("Failed to delete exchange rate")
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingRate(null)
    setFormData({
      fromCurrency: "",
      toCurrency: baseCurrency?.code || "",
      rate: "",
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleConvert = async () => {
    try {
      if (!formData.fromCurrency || !formData.toCurrency || !formData.rate) {
        toast.info("Please select currencies and enter an amount to convert")
        return
      }
      
      const testAmount = 100
      const convertedAmount = await exchangeRateService.convertAmount(
        testAmount, 
        formData.fromCurrency, 
        formData.toCurrency
      )
      
      const fromCurrency = currencies.find(c => c.code === formData.fromCurrency)
      const toCurrency = currencies.find(c => c.code === formData.toCurrency)
      
      toast.info(
        `${fromCurrency?.symbol || ''}${testAmount} ${formData.fromCurrency} = ${toCurrency?.symbol || ''}${convertedAmount.toFixed(2)} ${formData.toCurrency}`,
        { autoClose: 5000 }
      )
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filteredRates = exchangeRates.filter(rate => {
    const searchLower = searchTerm.toLowerCase()
    return (
      rate.fromCurrency.toLowerCase().includes(searchLower) ||
      rate.toCurrency.toLowerCase().includes(searchLower) ||
      rate.rate.toString().includes(searchTerm)
    )
  })

  const columns = [
    { key: "fromCurrency", label: "From" },
    { key: "toCurrency", label: "To" },
    { 
      key: "rate", 
      label: "Exchange Rate",
      render: (value) => value.toFixed(6)
    },
    {
      key: "date",
      label: "Date",
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: "createdBy", label: "Created By" }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="DollarSign" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Currency Rate Manager</h1>
            <p className="text-gray-600 mt-1">Manage exchange rates for multi-currency transactions</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate("/masters/currencies")}>
            <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
            Manage Currencies
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Rate
          </Button>
        </div>
      </div>

      {/* Base Currency Info */}
      {baseCurrency && (
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ApperIcon name="Star" className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-primary-800 font-medium">
                Base Currency: {baseCurrency.code} - {baseCurrency.name} ({baseCurrency.symbol})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "latest" ? "default" : "outline"}
                onClick={() => setViewMode("latest")}
                size="sm"
              >
                Latest Rates
              </Button>
              <Button
                variant={viewMode === "historical" ? "default" : "outline"}
                onClick={() => setViewMode("historical")}
                size="sm"
              >
                Historical
              </Button>
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                onClick={() => setViewMode("all")}
                size="sm"
              >
                All Rates
              </Button>
            </div>

            {viewMode === "historical" && (
              <div className="flex items-center space-x-2">
                <FormField
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="w-auto"
                />
                <span className="text-gray-500">to</span>
                <FormField
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="w-auto"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exchange Rates</CardTitle>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search rates..."
              className="w-72"
            />
          </div>
        </CardHeader>
        
<CardContent>
          {filteredRates.length > 0 ? (
            <DataTable
              data={filteredRates}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchable={false}
              emptyMessage="No exchange rates found matching your criteria"
            />
          ) : (
            <Empty
              title="No exchange rates found"
              description="Start by adding exchange rates for your currencies"
              actionLabel="Add Exchange Rate"
              onAction={() => setShowForm(true)}
              icon="DollarSign"
            />
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingRate ? "Edit" : "Create"} Exchange Rate
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <FormField
                label="From Currency"
                type="select"
                value={formData.fromCurrency}
                onChange={(e) => setFormData({...formData, fromCurrency: e.target.value})}
                options={currencies.map(c => ({ 
                  value: c.code, 
                  label: `${c.code} - ${c.name} (${c.symbol})` 
                }))}
                required
              />
              
              <FormField
                label="To Currency"
                type="select"
                value={formData.toCurrency}
                onChange={(e) => setFormData({...formData, toCurrency: e.target.value})}
                options={currencies.map(c => ({ 
                  value: c.code, 
                  label: `${c.code} - ${c.name} (${c.symbol})` 
                }))}
                required
              />
              
              <FormField
                label="Exchange Rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                step="0.000001"
                placeholder="1.000000"
                required
              />
              
              <FormField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Test Conversion:</span>
                  <Button variant="outline" size="sm" onClick={handleConvert}>
                    Convert 100 units
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingRate ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CurrencyRateManager