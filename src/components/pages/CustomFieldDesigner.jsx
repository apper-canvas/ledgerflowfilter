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
import customFieldService from "@/services/api/customFieldService"

const CustomFieldDesigner = () => {
  const [customFields, setCustomFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "text",
    entityType: "voucher",
    required: false,
    description: "",
    placeholder: "",
    helpText: "",
    options: [],
    validation: {}
  })
  const [newOption, setNewOption] = useState({ value: "", label: "" })

  useEffect(() => {
    loadCustomFields()
  }, [])

  const loadCustomFields = async () => {
    try {
      setError(null)
      const data = await customFieldService.getAll()
      setCustomFields(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.label) {
      toast.error("Name and label are required")
      return
    }

    // Validate field name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name)) {
      toast.error("Field name must start with a letter and contain only letters, numbers, and underscores")
      return
    }

    // Check for duplicate names
    const exists = customFields.some(field => 
      field.name === formData.name && field.Id !== editingField?.Id
    )
    if (exists) {
      toast.error("A field with this name already exists")
      return
    }

    try {
      if (editingField) {
        await customFieldService.update(editingField.Id, formData)
        toast.success("Custom field updated successfully")
      } else {
        await customFieldService.create(formData)
        toast.success("Custom field created successfully")
      }
      
      resetForm()
      loadCustomFields()
    } catch (err) {
      toast.error("Failed to save custom field")
    }
  }

  const handleEdit = (field) => {
    setEditingField(field)
    setFormData({
      ...field,
      options: field.options || [],
      validation: field.validation || {}
    })
    setShowForm(true)
  }

  const handleDelete = async (field) => {
    if (!confirm(`Are you sure you want to delete the custom field "${field.label}"?`)) {
      return
    }

    try {
      await customFieldService.delete(field.Id)
      toast.success("Custom field deleted successfully")
      loadCustomFields()
    } catch (err) {
      toast.error("Failed to delete custom field")
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingField(null)
    setFormData({
      name: "",
      label: "",
      type: "text",
      entityType: "voucher",
      required: false,
      description: "",
      placeholder: "",
      helpText: "",
      options: [],
      validation: {}
    })
    setNewOption({ value: "", label: "" })
  }

  const addOption = () => {
    if (!newOption.value || !newOption.label) {
      toast.error("Both option value and label are required")
      return
    }

    const exists = formData.options.some(opt => opt.value === newOption.value)
    if (exists) {
      toast.error("An option with this value already exists")
      return
    }

    setFormData({
      ...formData,
      options: [...formData.options, newOption]
    })
    setNewOption({ value: "", label: "" })
  }

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    })
  }

  const filteredFields = customFields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { key: "name", label: "Field Name" },
    { key: "label", label: "Display Label" },
    { key: "type", label: "Type" },
    { 
      key: "entityType", 
      label: "Entity", 
      render: (value) => value.charAt(0).toUpperCase() + value.slice(1)
    },
    { 
      key: "required", 
      label: "Required", 
      render: (value) => value ? "Yes" : "No"
    }
  ]

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "textarea", label: "Text Area" },
    { value: "checkbox", label: "Checkbox" }
  ]

  const entityTypes = [
    { value: "voucher", label: "Vouchers Only" },
    { value: "ledger", label: "Ledgers Only" },
    { value: "all", label: "Both Vouchers & Ledgers" }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadCustomFields} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="Settings2" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Custom Field Designer</h1>
            <p className="text-gray-600 mt-1">Create and manage custom fields for vouchers and master data</p>
          </div>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Custom Field
        </Button>
      </div>

      {/* Guide Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">
            <ApperIcon name="InfoIcon" className="w-4 h-4 mr-2 inline" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-800">
            <div>
              <strong>Field Types:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <strong>Text:</strong> Single line text input</li>
                <li>• <strong>Number:</strong> Numeric values with validation</li>
                <li>• <strong>Email:</strong> Email addresses with validation</li>
                <li>• <strong>Select:</strong> Dropdown with predefined options</li>
              </ul>
            </div>
            <div>
              <strong>Best Practices:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Use descriptive labels for user clarity</li>
                <li>• Set appropriate validation rules</li>
                <li>• Add help text for complex fields</li>
                <li>• Test fields before going live</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Custom Fields</CardTitle>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search custom fields..."
              className="w-72"
            />
          </div>
        </CardHeader>
        
<CardContent>
          {filteredFields.length > 0 ? (
            <DataTable
              data={filteredFields}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchable={false}
              emptyMessage="No custom fields found matching your search"
            />
          ) : (
            <Empty
              title="No custom fields found"
              description="Start by creating your first custom field to extend vouchers and master data"
              actionLabel="Add Custom Field"
              onAction={() => setShowForm(true)}
              icon="Settings2"
            />
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingField ? "Edit" : "Create"} Custom Field
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Field Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., customerReference"
                    required
                  />
                  
                  <FormField
                    label="Display Label"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    placeholder="e.g., Customer Reference"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Field Type"
                    type="select"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    options={fieldTypes}
                    required
                  />
                  
                  <FormField
                    label="Apply To"
                    type="select"
                    value={formData.entityType}
                    onChange={(e) => setFormData({...formData, entityType: e.target.value})}
                    options={entityTypes}
                    required
                  />
                </div>

                <FormField
                  label="Description"
                  type="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this field's purpose"
                  className="min-h-[60px]"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Placeholder Text"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                    placeholder="Hint text shown in empty field"
                  />
                  
                  <FormField
                    label="Help Text"
                    value={formData.helpText}
                    onChange={(e) => setFormData({...formData, helpText: e.target.value})}
                    placeholder="Additional guidance for users"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={formData.required}
                    onChange={(e) => setFormData({...formData, required: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="required" className="text-sm">Required Field</label>
                </div>

                {/* Options for Select Type */}
                {formData.type === "select" && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Dropdown Options</h4>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <FormField
                          label="Option Value"
                          value={newOption.value}
                          onChange={(e) => setNewOption({...newOption, value: e.target.value})}
                          placeholder="internal_value"
                        />
                        <FormField
                          label="Option Label"
                          value={newOption.label}
                          onChange={(e) => setNewOption({...newOption, label: e.target.value})}
                          placeholder="Display Text"
                        />
                      </div>
                      
                      <Button type="button" variant="outline" onClick={addOption} className="mb-3">
                        <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>

                      {formData.options.length > 0 && (
                        <div className="space-y-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">
                                <code className="bg-gray-200 px-1 rounded">{option.value}</code>
                                <span className="mx-2">→</span>
                                {option.label}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <ApperIcon name="X" className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Validation Rules */}
                {(formData.type === "text" || formData.type === "number") && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Validation Rules</h4>
                      
                      {formData.type === "number" && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            label="Minimum Value"
                            type="number"
                            value={formData.validation.min || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              validation: { ...formData.validation, min: parseFloat(e.target.value) || undefined }
                            })}
                            placeholder="Optional"
                          />
                          
                          <FormField
                            label="Maximum Value"
                            type="number"
                            value={formData.validation.max || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              validation: { ...formData.validation, max: parseFloat(e.target.value) || undefined }
                            })}
                            placeholder="Optional"
                          />
                        </div>
                      )}
                      
                      {formData.type === "text" && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            label="Minimum Length"
                            type="number"
                            value={formData.validation.min || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              validation: { ...formData.validation, min: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="Optional"
                          />
                          
                          <FormField
                            label="Maximum Length"
                            type="number"
                            value={formData.validation.max || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              validation: { ...formData.validation, max: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="Optional"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingField ? "Update" : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomFieldDesigner