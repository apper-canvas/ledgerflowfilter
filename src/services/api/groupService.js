import auditService from "@/services/api/auditService";
import groupsData from "@/services/mockData/groups.json";

class GroupService {
  constructor() {
    this.data = [...groupsData]
  }

  async getAll() {
    await this.delay(200)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(150)
    const item = this.data.find(g => g.Id === parseInt(id))
    if (!item) {
      throw new Error("Group not found")
    }
    return { ...item }
  }

async create(group) {
    await this.delay(250)
    const newId = Math.max(...this.data.map(g => g.Id)) + 1
    const newGroup = {
      ...group,
      Id: newId
    }
    this.data.push(newGroup)
    
    // Log the creation
    await auditService.logOperation(
      'group',
      newId,
      'create',
      { name: newGroup.name, nature: newGroup.nature },
      null,
      newGroup
    )
    
    return { ...newGroup }
  }

async update(id, group) {
    await this.delay(250)
    const index = this.data.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Group not found")
    }
    
    const oldGroup = { ...this.data[index] }
    const updatedGroup = { ...group, Id: parseInt(id) }
    this.data[index] = updatedGroup
    
    // Log the update
    await auditService.logOperation(
      'group',
      parseInt(id),
      'update',
      { name: updatedGroup.name, nature: updatedGroup.nature },
      oldGroup,
      updatedGroup
    )
    
    return { ...updatedGroup }
  }

async delete(id) {
    await this.delay(200)
    const index = this.data.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Group not found")
    }
    
    const deletedGroup = { ...this.data[index] }
    this.data.splice(index, 1)
    
    // Log the deletion
    await auditService.logOperation(
      'group',
      parseInt(id),
      'delete',
      null,
      deletedGroup,
      null
    )
    
    return true
  }
async search(query, filters = {}) {
    await this.delay(150)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(group =>
        group.name.toLowerCase().includes(searchTerm) ||
        group.nature?.toLowerCase().includes(searchTerm) ||
        group.parent?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.nature && filters.nature !== 'all') {
      results = results.filter(group => group.nature === filters.nature)
    }
    
    if (filters.parent && filters.parent !== 'all') {
      results = results.filter(group => group.parent === filters.parent)
    }
    
    return results
  }

  async getByNature(nature) {
    await this.delay(150)
    return this.data.filter(group => group.nature === nature)
  }

  async getParentGroups() {
    await this.delay(150)
    return this.data.filter(group => !group.parent)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new GroupService()