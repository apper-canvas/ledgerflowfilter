import groupsData from "@/services/mockData/groups.json"

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
    return { ...newGroup }
  }

  async update(id, group) {
    await this.delay(250)
    const index = this.data.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Group not found")
    }
    const updatedGroup = { ...group, Id: parseInt(id) }
    this.data[index] = updatedGroup
    return { ...updatedGroup }
  }

  async delete(id) {
    await this.delay(200)
    const index = this.data.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Group not found")
    }
    this.data.splice(index, 1)
    return true
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new GroupService()