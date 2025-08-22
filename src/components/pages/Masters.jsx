import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
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
import ledgerService from "@/services/api/ledgerService"
import groupService from "@/services/api/groupService"

const Masters = () => {
  const { section } = useParams()
  const currentSection = section || "ledgers"
  
  const [data, setData] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadData()
    if (currentSection === "ledgers") {
      loadGroups()
    }
  }, [currentSection])

  const loadData = async () => {
    try {
      setError(null)
      let result = []
      
      switch (currentSection) {
        case "ledgers":
          result = await ledgerService.getAll()
          break
        case "groups":
          result = await groupService.getAll()
          break
        default:
          result = []
      }
      
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const groupData = await groupService.getAll()
      setGroups(groupData)
    } catch (err) {
      console.error("Failed to load groups:", err)
    }
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        await (currentSection === "ledgers" ? ledgerService : groupService)
          .update(editingItem.Id, formData)
        toast.success(`${currentSection.slice(0, -1)} updated successfully`)
      } else {
        await (currentSection === "ledgers" ? ledgerService : groupService)
          .create(formData)
        toast.success(`${currentSection.slice(0, -1)} created successfully`)
      }
      
      setShowForm(false)
      setEditingItem(null)
      setFormData({})
      loadData()
    } catch (err) {
      toast.error("Failed to save data")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete this ${currentSection.slice(0, -1)}?`)) {
      return
    }

    try {
      await (currentSection === "ledgers" ? ledgerService : groupService)
        .delete(item.Id)
      toast.success(`${currentSection.slice(0, -1)} deleted successfully`)
      loadData()
    } catch (err) {
      toast.error("Failed to delete item")
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({})
  }

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.group?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sections = [
    { key: "ledgers", label: "Ledgers", icon: "BookOpen" },
    { key: "groups", label: "Groups", icon: "FolderOpen" },
    { key: "cost-centers", label: "Cost Centers", icon: "Target" },
    { key: "currencies", label: "Currencies", icon: "DollarSign" }
  ]

  const ledgerColumns = [
    { key: "name", label: "Name" },
    { key: "group", label: "Group" },
    { 
      key: "openingBalance", 
      label: "Opening Balance", 
      render: (value) => `₹${value?.toFixed(2) || "0.00"}`
    },
    {
      key: "currentBalance",
      label: "Current Balance", 
      render: (value) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          ₹{value?.toFixed(2) || "0.00"}
        </span>
      )
    },
    { 
      key: "gstApplicable", 
      label: "GST", 
      render: (value) => value ? "Yes" : "No"
    }
  ]

  const groupColumns = [
    { key: "name", label: "Name" },
    { key: "nature", label: "Nature" },
    { key: "parent", label: "Parent Group" }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="Database" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Masters</h1>
            <p className="text-gray-600 mt-1">Manage chart of accounts and master data</p>
          </div>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New {currentSection.slice(0, -1)}
        </Button>
      </div>

      {/* Section Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1">
            {sections.map((tab) => (
              <Button
                key={tab.key}
                variant={currentSection === tab.key ? "default" : "ghost"}
                onClick={() => window.location.href = `/masters/${tab.key}`}
                className="flex items-center"
              >
                <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{currentSection}</CardTitle>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search ${currentSection}...`}
              className="w-72"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredData.length > 0 ? (
            <DataTable
              data={filteredData}
              columns={currentSection === "ledgers" ? ledgerColumns : groupColumns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Empty
              title={`No ${currentSection} found`}
              description={`Start by creating your first ${currentSection.slice(0, -1)}`}
              actionLabel={`Add ${currentSection.slice(0, -1)}`}
              onAction={() => setShowForm(true)}
              icon={currentSection === "ledgers" ? "BookOpen" : "FolderOpen"}
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
                {editingItem ? "Edit" : "Create"} {currentSection.slice(0, -1)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {currentSection === "ledgers" ? (
                <>
                  <FormField
                    label="Name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  
                  <FormField
                    label="Group"
                    type="select"
                    value={formData.group || ""}
                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                    options={groups.map(g => ({ value: g.name, label: g.name }))}
                    required
                  />
                  
                  <FormField
                    label="Opening Balance"
                    type="number"
                    value={formData.openingBalance || 0}
                    onChange={(e) => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gstApplicable"
                      checked={formData.gstApplicable || false}
                      onChange={(e) => setFormData({...formData, gstApplicable: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="gstApplicable" className="text-sm">GST Applicable</label>
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    label="Name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  
                  <FormField
                    label="Nature"
                    type="select"
                    value={formData.nature || ""}
                    onChange={(e) => setFormData({...formData, nature: e.target.value})}
                    options={[
                      { value: "Assets", label: "Assets" },
                      { value: "Liabilities", label: "Liabilities" },
                      { value: "Income", label: "Income" },
                      { value: "Expenses", label: "Expenses" }
                    ]}
                    required
                  />
                  
                  <FormField
                    label="Parent Group"
                    value={formData.parent || ""}
                    onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  />
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={resetForm}>
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

export default Masters