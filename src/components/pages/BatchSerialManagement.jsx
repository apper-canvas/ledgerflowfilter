import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import DataTable from "@/components/organisms/DataTable"
import BatchSerialPicker from "@/components/molecules/BatchSerialPicker"
import batchSerialService from "@/services/api/batchSerialService"
import stockItemService from "@/services/api/stockItemService"

const BatchSerialManagement = () => {
  const [batchSerials, setBatchSerials] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStockItem, setSelectedStockItem] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showPicker, setShowPicker] = useState(false)
  const [pickerStockItem, setPickerStockItem] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterData()
  }, [batchSerials, searchTerm, selectedStockItem, selectedType, selectedStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      const [batchSerialsData, stockItemsData] = await Promise.all([
        batchSerialService.getAll(),
        stockItemService.getAll()
      ])
      setBatchSerials(batchSerialsData)
      setStockItems(stockItemsData)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = [...batchSerials]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Stock item filter
    if (selectedStockItem) {
      filtered = filtered.filter(item => item.stockItemId === parseInt(selectedStockItem))
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    setFilteredData(filtered)
  }

  const handleManageItem = (row) => {
    const stockItem = stockItems.find(s => s.Id === row.stockItemId)
    if (stockItem) {
      setPickerStockItem(stockItem)
      setShowPicker(true)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this batch/serial number?")) return

    try {
      await batchSerialService.delete(item.Id)
      toast.success("Deleted successfully")
      await loadData()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const getStockItemName = (stockItemId) => {
    const item = stockItems.find(s => s.Id === stockItemId)
    return item ? item.name : "Unknown"
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return { status: "expired", days: Math.abs(daysUntilExpiry) }
    if (daysUntilExpiry <= 30) return { status: "expiring", days: daysUntilExpiry }
    return { status: "valid", days: daysUntilExpiry }
  }

  const columns = [
    { 
      key: "stockItemId", 
      label: "Stock Item", 
      render: (value) => (
        <div>
          <div className="font-medium">{getStockItemName(value)}</div>
          <div className="text-xs text-gray-500">ID: {value}</div>
        </div>
      )
    },
    { key: "number", label: "Number" },
    { 
      key: "type", 
      label: "Type", 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "batch" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: "remainingQuantity", 
      label: "Available", 
      render: (value, row) => {
        const stockItem = stockItems.find(s => s.Id === row.stockItemId)
        return `${value} ${stockItem?.unit || ''}`
      }
    },
    { key: "rate", label: "Rate", render: (value) => `₹${value.toFixed(2)}` },
    { key: "location", label: "Location" },
    { 
      key: "manufacturingDate", 
      label: "Mfg Date", 
      render: (value) => new Date(value).toLocaleDateString() 
    },
    { 
      key: "expiryDate", 
      label: "Expiry Date", 
      render: (value, row) => {
        if (!value) return "-"
        
        const expiryStatus = getExpiryStatus(value)
        const date = new Date(value).toLocaleDateString()
        
        return (
          <div>
            <div>{date}</div>
            {expiryStatus && (
              <div className={`text-xs font-medium ${
                expiryStatus.status === "expired" ? "text-red-600" :
                expiryStatus.status === "expiring" ? "text-orange-600" : "text-green-600"
              }`}>
                {expiryStatus.status === "expired" ? `Expired ${expiryStatus.days}d ago` :
                 expiryStatus.status === "expiring" ? `Expires in ${expiryStatus.days}d` :
                 `Valid for ${expiryStatus.days}d`}
              </div>
            )}
          </div>
        )
      }
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "active" ? "bg-green-100 text-green-800" :
          value === "expired" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ]

  const stockItemOptions = [
    { value: "", label: "All Stock Items" },
    ...stockItems.map(item => ({
      value: item.Id.toString(),
      label: `${item.name} (${item.batchSerialTracking})`
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <ApperIcon name="Package" className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batch/Serial Management</h1>
            <p className="text-gray-600 mt-1">Manage batch numbers and serial numbers for inventory items</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="Package" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batchSerials.filter(b => b.type === "batch").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="Hash" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Serial Numbers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batchSerials.filter(b => b.type === "serial").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="AlertTriangle" className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batchSerials.filter(b => {
                    if (!b.expiryDate) return false
                    const expiry = getExpiryStatus(b.expiryDate)
                    return expiry && expiry.status === "expiring"
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="X" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batchSerials.filter(b => {
                    if (!b.expiryDate) return false
                    const expiry = getExpiryStatus(b.expiryDate)
                    return expiry && expiry.status === "expired"
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by number or location..."
            />

            <FormField
              label="Stock Item"
              type="select"
              value={selectedStockItem}
              onChange={(e) => setSelectedStockItem(e.target.value)}
              options={stockItemOptions}
            />

            <FormField
              label="Type"
              type="select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: "all", label: "All Types" },
                { value: "batch", label: "Batch" },
                { value: "serial", label: "Serial" }
              ]}
            />

            <FormField
              label="Status"
              type="select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
                { value: "sold", label: "Sold" }
              ]}
            />

            <div className="flex items-end">
              <Button onClick={loadData} disabled={loading}>
                <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batch & Serial Numbers ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              onEdit={handleManageItem}
              onDelete={handleDelete}
            />
          )}

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <ApperIcon name="Package" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No batch/serial numbers found</p>
              <p className="text-sm mt-1">Create batch/serial numbers from the voucher entry form</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch/Serial Picker Modal */}
      {showPicker && (
        <BatchSerialPicker
          isOpen={showPicker}
          onClose={() => {
            setShowPicker(false)
            setPickerStockItem(null)
            loadData() // Refresh data after managing
          }}
          stockItem={pickerStockItem}
          mode="manage"
        />
      )}
    </div>
  )
}

export default BatchSerialManagement