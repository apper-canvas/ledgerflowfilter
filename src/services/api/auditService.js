import auditLogsData from "@/services/mockData/auditLogs.json"

class AuditService {
  constructor() {
    this.data = [...auditLogsData]
    this.nextId = Math.max(...this.data.map(log => log.Id)) + 1
  }

  async getAll() {
    await this.delay(200)
    return [...this.data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async getById(id) {
    await this.delay(150)
    const item = this.data.find(log => log.Id === parseInt(id))
    if (!item) {
      throw new Error("Audit log not found")
    }
    return { ...item }
  }

  async getByEntity(entityType, entityId = null) {
    await this.delay(200)
    let filtered = this.data.filter(log => log.entityType === entityType)
    
    if (entityId) {
      filtered = filtered.filter(log => log.entityId === parseInt(entityId))
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async getByUser(userId) {
    await this.delay(200)
    return this.data
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async getByDateRange(fromDate, toDate) {
    await this.delay(200)
    const from = new Date(fromDate)
    const to = new Date(toDate)
    
    return this.data
      .filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= from && logDate <= to
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async logOperation(entityType, entityId, operation, changes = null, oldValues = null, newValues = null) {
    await this.delay(100)
    
    const logEntry = {
      Id: this.nextId++,
      entityType,
      entityId: parseInt(entityId),
      operation, // create, update, delete
      userId: "user1", // In a real app, this would come from authentication
      userName: "Admin User", // In a real app, this would come from user context
      timestamp: new Date().toISOString(),
      changes,
      oldValues,
      newValues,
      ipAddress: "127.0.0.1", // In a real app, this would be captured from request
      userAgent: navigator.userAgent || "Unknown"
    }
    
    this.data.unshift(logEntry)
    return { ...logEntry }
  }

  async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]
    
    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(log =>
        log.entityType.toLowerCase().includes(searchTerm) ||
        log.operation.toLowerCase().includes(searchTerm) ||
        log.userName.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.changes || {}).toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.entityType && filters.entityType !== 'all') {
      results = results.filter(log => log.entityType === filters.entityType)
    }
    
    if (filters.operation && filters.operation !== 'all') {
      results = results.filter(log => log.operation === filters.operation)
    }
    
    if (filters.userId && filters.userId !== 'all') {
      results = results.filter(log => log.userId === filters.userId)
    }
    
    if (filters.dateRange) {
      const { from, to } = filters.dateRange
      if (from || to) {
        results = results.filter(log => {
          const logDate = new Date(log.timestamp)
          const fromDate = from ? new Date(from) : new Date('1900-01-01')
          const toDate = to ? new Date(to) : new Date('2100-12-31')
          return logDate >= fromDate && logDate <= toDate
        })
      }
    }
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async getStats() {
    await this.delay(150)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 7)
    
    const todayLogs = this.data.filter(log => 
      new Date(log.timestamp).toDateString() === today.toDateString()
    )
    
    const yesterdayLogs = this.data.filter(log => 
      new Date(log.timestamp).toDateString() === yesterday.toDateString()
    )
    
    const last7DaysLogs = this.data.filter(log => 
      new Date(log.timestamp) >= last7Days
    )
    
    const operationCounts = this.data.reduce((acc, log) => {
      acc[log.operation] = (acc[log.operation] || 0) + 1
      return acc
    }, {})
    
    const entityCounts = this.data.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1
      return acc
    }, {})
    
    return {
      total: this.data.length,
      today: todayLogs.length,
      yesterday: yesterdayLogs.length,
      last7Days: last7DaysLogs.length,
      operations: operationCounts,
      entities: entityCounts
    }
  }

  async getRecentActivity(limit = 10) {
    await this.delay(150)
    return this.data
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new AuditService()