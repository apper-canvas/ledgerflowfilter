import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import FormField from "@/components/molecules/FormField"
import DataTable from "@/components/organisms/DataTable"
import batchSerialService from "@/services/api/batchSerialService"
import { cn } from "@/utils/cn"

const BatchSerialPicker = ({ 
  isOpen, 
  onClose, 
  stockItem, 
  selectedItems = [], 
  onSelect,
  mode = "select" // "select" or "manage"
}) => {
  const [batchSerials, setBatchSerials] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    type: stockItem?.batchSerialTracking || "batch",
    number: "",
    quantity: 1,
    manufacturingDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    rate: 0,
    location: "Warehouse A",
    status: "active"
  })

  useEffect(() => {
    if (isOpen && stockItem) {
      loadBatchSerials()
      setFormData(prev => ({
        ...prev,
        type: stockItem.batchSerialTracking,
        rate: stockItem.openingStock?.rate || 0
      }))
    }
  }, [isOpen, stockItem])

  useEffect(() => {
    filterItems()
  }, [batchSerials, searchTerm, statusFilter])

  const loadBatchSerials = async () => {
    if (!stockItem) return
    
    setLoading(true)
    try {
      const data = await batchSerialService.getByStockItemId(stockItem.Id)
      setBatchSerials(data)
    } catch (error) {
      toast.error("Failed to load batch/serial data")
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...batchSerials]
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }
    
    // For selection mode, only show items with remaining quantity
    if (mode === "select") {
      filtered = filtered.filter(item => item.remainingQuantity > 0)
    }
    
    setFilteredItems(filtered)
  }

  const handleGenerateNumber = async () => {
    try {
      let number
      if (formData.type === "batch") {
        number = await batchSerialService.generateBatchNumber(stockItem.Id)
      } else {
        number = await batchSerialService.generateSerialNumber(stockItem.Id)
      }
      setFormData(prev => ({ ...prev, number }))
    } catch (error) {
      toast.error("Failed to generate number")
    }
  }

  const handleSave = async () => {
    if (!formData.number.trim()) {
      toast.error("Number is required")
      return
    }
    
    if (formData.quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    try {
      const data = {
        ...formData,
        stockItemId: stockItem.Id,
        remainingQuantity: formData.quantity,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate)
      }

      if (editingItem) {
        await batchSerialService.update(editingItem.Id, data)
        toast.success("Updated successfully")
      } else {
        await batchSerialService.create(data)
        toast.success("Created successfully")
      }

      await loadBatchSerials()
      handleCancelForm()
    } catch (error) {
      toast.error("Failed to save")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      number: item.number,
      quantity: item.quantity,
      manufacturingDate: item.manufacturingDate,
      expiryDate: item.expiryDate || "",
      rate: item.rate,
      location: item.location,
      status: item.status
    })
    setShowAddForm(true)
  }

  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      await batchSerialService.delete(item.Id)
      toast.success("Deleted successfully")
      await loadBatchSerials()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const handleSelect = (item) => {
    if (mode !== "select") return
    
    const isSelected = selectedItems.some(s => s.Id === item.Id)
    let newSelection
    
    if (isSelected) {
      newSelection = selectedItems.filter(s => s.Id !== item.Id)
    } else {
      newSelection = [...selectedItems, { ...item, selectedQuantity: 1 }]
    }
    
    onSelect(newSelection)
  }

  const updateSelectedQuantity = (item, quantity) => {
    const newSelection = selectedItems.map(s => 
      s.Id === item.Id ? { ...s, selectedQuantity: Math.min(quantity, s.remainingQuantity) } : s
    )
    onSelect(newSelection)
  }

  const handleCancelForm = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({
      type: stockItem?.batchSerialTracking || "batch",
      number: "",
      quantity: 1,
      manufacturingDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      rate: stockItem?.openingStock?.rate || 0,
      location: "Warehouse A",
      status: "active"
    })
  }

  const columns = [
    { key: "number", label: "Number" },
    { key: "type", label: "Type", render: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: "remainingQuantity", label: "Available", render: (value, row) => `${value} ${stockItem?.unit || ''}` },
    { key: "rate", label: "Rate", render: (value) => `₹${value.toFixed(2)}` },
    { key: "location", label: "Location" },
    { key: "manufacturingDate", label: "Mfg Date", render: (value) => new Date(value).toLocaleDateString() },
    ...(stockItem?.trackExpiry ? [{ 
      key: "expiryDate", 
      label: "Expiry Date", 
      render: (value) => value ? new Date(value).toLocaleDateString() : "-" 
    }] : []),
    { key: "status", label: "Status", render: (value) => (
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      )}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )}
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "select" ? "Select" : "Manage"} {stockItem?.batchSerialTracking === "batch" ? "Batch" : "Serial"} Numbers
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {stockItem?.name} ({stockItem?.unit})
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <FormField
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by number or location..."
              />
            </div>
            <div className="w-48">
              <FormField
                label="Status"
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                  { value: "sold", label: "Sold" }
                ]}
              />
            </div>
            {mode === "manage" && (
              <div className="flex items-end">
                <Button onClick={() => setShowAddForm(true)}>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            )}
          </div>

          {/* Selected Items Summary (Selection Mode) */}
          {mode === "select" && selectedItems.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Selected Items ({selectedItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div key={item.Id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{item.number}</span>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          max={item.remainingQuantity}
                          value={item.selectedQuantity}
                          onChange={(e) => updateSelectedQuantity(item, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center"
                        />
                        <span className="text-sm text-gray-500">/ {item.remainingQuantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelect(item)}
                        >
                          <ApperIcon name="X" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingItem ? "Edit" : "Add"} {formData.type === "batch" ? "Batch" : "Serial"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex space-x-2">
                    <FormField
                      label="Number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="Enter number"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateNumber}
                      className="mt-7"
                    >
                      <ApperIcon name="Zap" className="w-4 h-4" />
                    </Button>
                  </div>

                  <FormField
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                    min="1"
                    step={formData.type === "serial" ? "1" : "0.01"}
                    required
                  />

                  <FormField
                    label="Rate"
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    step="0.01"
                    required
                  />

                  <FormField
                    label="Manufacturing Date"
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                  />

                  {stockItem?.trackExpiry && (
                    <FormField
                      label="Expiry Date"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  )}

                  <FormField
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />

                  <FormField
                    label="Status"
                    type="select"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "expired", label: "Expired" },
                      { value: "sold", label: "Sold" }
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
          ) : (
            <DataTable
              data={filteredItems}
              columns={columns}
              onEdit={mode === "manage" ? handleEdit : undefined}
              onDelete={mode === "manage" ? handleDelete : undefined}
              onView={mode === "select" ? handleSelect : undefined}
            />
          )}

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <ApperIcon name="Package" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {stockItem?.batchSerialTracking} numbers found</p>
              {mode === "manage" && (
                <Button onClick={() => setShowAddForm(true)} className="mt-4">
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "select" && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedItems.length} item(s) selected
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => onClose(selectedItems)} 
                disabled={selectedItems.length === 0}
              >
                <ApperIcon name="Check" className="w-4 h-4 mr-2" />
                Confirm Selection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BatchSerialPicker