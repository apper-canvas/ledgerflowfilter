import React from "react"
import FormField from "@/components/molecules/FormField"

const CustomFieldRenderer = ({ 
  customFields, 
  fieldValues = {}, 
  onChange, 
  errors = {},
  className = ""
}) => {
  if (!customFields || customFields.length === 0) {
    return null
  }

  const handleFieldChange = (fieldName, value) => {
    if (onChange) {
      onChange({
        ...fieldValues,
        [fieldName]: value
      })
    }
  }

  const renderField = (field) => {
    const value = fieldValues[field.name] || ""
    
    switch (field.type) {
      case "select":
        return (
          <FormField
            key={field.name}
            label={field.label}
            type="select"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            options={[
              { value: "", label: `Select ${field.label}` },
              ...(field.options || [])
            ]}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.name]}
            className="mb-4"
          />
        )
      
      case "checkbox":
        return (
          <div key={field.name} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.name}
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="mr-2"
              />
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-600 mt-1 ml-6">{field.helpText}</p>
            )}
            {errors[field.name] && (
              <p className="text-sm text-red-500 mt-1 ml-6">{errors[field.name]}</p>
            )}
          </div>
        )
      
      default:
        return (
          <FormField
            key={field.name}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.name]}
            className="mb-4"
          />
        )
    }
  }

  return (
    <div className={className}>
      <h4 className="font-medium text-gray-900 mb-4">Additional Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map(renderField)}
      </div>
    </div>
  )
}

export default CustomFieldRenderer