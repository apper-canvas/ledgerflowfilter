import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import DataTable from "@/components/organisms/DataTable"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"
import stockItemService from "@/services/api/stockItemService"

const Inventory = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    unit: "Nos",
    hsnCode: "",
    gstRate: 18,
    openingStock: {
      quantity: 0,
      rate: 0,
      value: 0
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const result = await stockItemService.getAll()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const itemData = {
        ...formData,
        openingStock: {
          ...formData.openingStock,
          value: formData.openingStock.quantity * formData.openingStock.rate
        }
      }

      if (editingItem) {
        await stockItemService.update(editingItem.Id, itemData)
        toast.success("Stock item updated successfully")
      } else {
        await stockItemService.create(itemData)
        toast.success("Stock item created successfully")
      }
      
      setShowForm(false)
      setEditingItem(null)
      resetForm()
      loadData()
    } catch (err) {
      toast.error("Failed to save stock item")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this stock item?")) {
      return
    }

    try {
      await stockItemService.delete(item.Id)
      toast.success("Stock item deleted successfully")
      loadData()
    } catch (err) {
      toast.error("Failed to delete stock item")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "Nos",
      hsnCode: "",
      gstRate: 18,
      openingStock: {
        quantity: 0,
        rate: 0,
        value: 0
      }
    })
  }

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsnCode?.includes(searchTerm)
  )

  const columns = [
    { key: "name", label: "Item Name" },
    { key: "unit", label: "Unit" },
    { key: "hsnCode", label: "HSN Code" },
    { 
      key: "gstRate", 
      label: "GST Rate", 
      render: (value) => `${value}%`
    },
    { 
      key: "openingStock", 
      label: "Opening Stock", 
      render: (value) => `${value?.quantity || 0} ${value?.unit || ""}`
},
    { 
      key: "stockValue", 
      label: "Stock Value", 
      render: (value) => `₹${(value?.value || 0).toFixed(2)}`
    }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="Package" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage stock items and inventory tracking</p>
          </div>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Stock Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Package" className="w-6 h-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{data.reduce((sum, item) => sum + (item.openingStock?.value || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="AlertTriangle" className="w-6 h-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="XCircle" className="w-6 h-6 text-red-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Items</CardTitle>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search stock items..."
              className="w-72"
            />
          </div>
        </CardHeader>
        
<CardContent>
          {filteredData.length > 0 ? (
            <DataTable
              data={filteredData}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchable={false}
              emptyMessage="No stock items found"
            />
          ) : (
            <Empty
              title="No stock items found"
              description="Start by adding your first stock item to track inventory"
              actionLabel="Add Stock Item"
              onAction={() => setShowForm(true)}
              icon="Package"
            />
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>
                {editingItem ? "Edit" : "Create"} Stock Item
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <FormField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Unit of Measure"
                  type="select"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  options={[
                    { value: "Nos", label: "Numbers" },
                    { value: "Kg", label: "Kilograms" },
                    { value: "Ltr", label: "Liters" },
                    { value: "Mtr", label: "Meters" },
                    { value: "Box", label: "Box" },
                    { value: "Pcs", label: "Pieces" }
                  ]}
                />
                
                <FormField
                  label="HSN Code"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({...formData, hsnCode: e.target.value})}
                />
              </div>
              
              <FormField
                label="GST Rate (%)"
                type="number"
                value={formData.gstRate}
                onChange={(e) => setFormData({...formData, gstRate: parseFloat(e.target.value) || 0})}
                min="0"
                max="28"
              />
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Opening Stock</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    label="Quantity"
                    type="number"
                    value={formData.openingStock.quantity}
                    onChange={(e) => setFormData({
                      ...formData,
                      openingStock: {
                        ...formData.openingStock,
                        quantity: parseFloat(e.target.value) || 0
                      }
                    })}
                    min="0"
                  />
                  
                  <FormField
                    label="Rate"
                    type="number"
                    value={formData.openingStock.rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      openingStock: {
                        ...formData.openingStock,
                        rate: parseFloat(e.target.value) || 0
                      }
                    })}
                    step="0.01"
                    min="0"
                  />
                  
                  <FormField
                    label="Value"
                    type="number"
                    value={formData.openingStock.quantity * formData.openingStock.rate}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Inventory