import customFieldsData from "@/services/mockData/customFields.json"

class CustomFieldService {
  constructor() {
    this.data = [...customFieldsData]
  }

  async getAll() {
    await this.delay(200)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(150)
    const item = this.data.find(cf => cf.Id === parseInt(id))
    if (!item) {
      throw new Error("Custom field not found")
    }
    return { ...item }
  }

  async getByEntity(entityType) {
    await this.delay(200)
    return this.data.filter(cf => cf.entityType === entityType || cf.entityType === 'all')
  }

  async create(customField) {
    await this.delay(300)
    const newId = Math.max(...this.data.map(cf => cf.Id)) + 1
    const newCustomField = {
      ...customField,
      Id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.data.push(newCustomField)
    return { ...newCustomField }
  }

  async update(id, customField) {
    await this.delay(300)
    const index = this.data.findIndex(cf => cf.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Custom field not found")
    }
    const updatedCustomField = { 
      ...customField, 
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }
    this.data[index] = updatedCustomField
    return { ...updatedCustomField }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(cf => cf.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Custom field not found")
    }
    this.data.splice(index, 1)
    return true
  }

  validateFieldValue(fieldDefinition, value) {
    if (fieldDefinition.required && (!value || value.toString().trim() === '')) {
      return `${fieldDefinition.label} is required`
    }

    if (value && fieldDefinition.validation) {
      const { type, min, max, pattern } = fieldDefinition.validation
      
      switch (type) {
        case 'number':
          const numValue = parseFloat(value)
          if (isNaN(numValue)) return `${fieldDefinition.label} must be a valid number`
          if (min !== undefined && numValue < min) return `${fieldDefinition.label} must be at least ${min}`
          if (max !== undefined && numValue > max) return `${fieldDefinition.label} must be at most ${max}`
          break
        
        case 'text':
          if (min !== undefined && value.length < min) return `${fieldDefinition.label} must be at least ${min} characters`
          if (max !== undefined && value.length > max) return `${fieldDefinition.label} must be at most ${max} characters`
          if (pattern && !new RegExp(pattern).test(value)) return `${fieldDefinition.label} format is invalid`
          break
        
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailPattern.test(value)) return `${fieldDefinition.label} must be a valid email address`
          break
      }
    }

    return null
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new CustomFieldService()