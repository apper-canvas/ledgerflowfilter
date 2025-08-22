import usersData from "@/services/mockData/users.json"
import auditService from "@/services/api/auditService"

class UserService {
  constructor() {
    this.data = [...usersData]
    this.nextId = Math.max(...this.data.map(user => user.Id)) + 1
    this.currentUser = this.data[0] // Default to admin for demo
  }

  // Role and Permission Definitions
  getRoles() {
    return [
      {
        name: "Admin",
        description: "Full system access",
        permissions: ["all"]
      },
      {
        name: "Accountant", 
        description: "Accounting operations and reports",
        permissions: [
          "dashboard_view", "voucher_create", "voucher_edit", "voucher_delete",
          "reports_view", "masters_view", "masters_edit", "inventory_view",
          "notifications_view", "audit_view"
        ]
      },
      {
        name: "Data Entry",
        description: "Basic data entry operations",
        permissions: [
          "dashboard_view", "voucher_create", "masters_create", 
          "inventory_view", "notifications_view"
        ]
      },
      {
        name: "Viewer",
        description: "Read-only access to reports",
        permissions: ["dashboard_view", "reports_view", "notifications_view"]
      }
    ]
  }

  getPermissions() {
    return [
      { key: "dashboard_view", name: "View Dashboard", category: "General" },
      { key: "voucher_create", name: "Create Vouchers", category: "Vouchers" },
      { key: "voucher_edit", name: "Edit Vouchers", category: "Vouchers" },
      { key: "voucher_delete", name: "Delete Vouchers", category: "Vouchers" },
      { key: "masters_view", name: "View Masters", category: "Masters" },
      { key: "masters_create", name: "Create Masters", category: "Masters" },
      { key: "masters_edit", name: "Edit Masters", category: "Masters" },
      { key: "masters_delete", name: "Delete Masters", category: "Masters" },
      { key: "reports_view", name: "View Reports", category: "Reports" },
      { key: "reports_export", name: "Export Reports", category: "Reports" },
      { key: "inventory_view", name: "View Inventory", category: "Inventory" },
      { key: "inventory_edit", name: "Edit Inventory", category: "Inventory" },
      { key: "notifications_view", name: "View Notifications", category: "System" },
      { key: "audit_view", name: "View Audit Logs", category: "System" },
      { key: "users_manage", name: "Manage Users", category: "System" },
      { key: "system_settings", name: "System Settings", category: "System" }
    ]
  }

  // Authentication Methods
  getCurrentUser() {
    return { ...this.currentUser }
  }

  async login(username, password) {
    await this.delay(500)
    const user = this.data.find(u => u.username === username && u.isActive)
    
    if (!user) {
      throw new Error("Invalid username or user is inactive")
    }
    
    // In a real app, you'd verify the password hash
    // For demo purposes, we'll accept any password
    
    user.lastLogin = new Date().toISOString()
    this.currentUser = user
    
    await auditService.logOperation(
      'user',
      user.Id,
      'login',
      { username: user.username },
      null,
      null
    )
    
    return { ...user }
  }

  async logout() {
    await this.delay(200)
    const user = this.currentUser
    
    await auditService.logOperation(
      'user',
      user.Id,
      'logout',
      { username: user.username },
      null,
      null
    )
    
    this.currentUser = null
    return true
  }

  // Permission Checking
  hasPermission(permission) {
    if (!this.currentUser) return false
    if (this.currentUser.permissions.includes("all")) return true
    return this.currentUser.permissions.includes(permission)
  }

  hasRole(role) {
    return this.currentUser?.role === role
  }

  // CRUD Operations
  async getAll() {
    await this.delay(200)
    return [...this.data]
  }

  async getById(id) {
    await this.delay(150)
    const user = this.data.find(u => u.Id === parseInt(id))
    if (!user) {
      throw new Error("User not found")
    }
    return { ...user }
  }

  async create(userData) {
    await this.delay(300)
    
    // Check for duplicate username/email
    const existingUser = this.data.find(u => 
      u.username === userData.username || u.email === userData.email
    )
    if (existingUser) {
      throw new Error("Username or email already exists")
    }

    const roleData = this.getRoles().find(r => r.name === userData.role)
    if (!roleData) {
      throw new Error("Invalid role specified")
    }

    const newUser = {
      ...userData,
      Id: this.nextId++,
      permissions: roleData.permissions,
      isActive: userData.isActive !== false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    this.data.push(newUser)
    
    await auditService.logOperation(
      'user',
      newUser.Id,
      'create',
      { 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      },
      null,
      newUser
    )

    return { ...newUser }
  }

  async update(id, userData) {
    await this.delay(300)
    const index = this.data.findIndex(u => u.Id === parseInt(id))
    if (index === -1) {
      throw new Error("User not found")
    }

    const oldUser = { ...this.data[index] }
    
    // Check for duplicate username/email (excluding current user)
    const existingUser = this.data.find(u => 
      u.Id !== parseInt(id) && 
      (u.username === userData.username || u.email === userData.email)
    )
    if (existingUser) {
      throw new Error("Username or email already exists")
    }

    const roleData = this.getRoles().find(r => r.name === userData.role)
    if (!roleData) {
      throw new Error("Invalid role specified")
    }

    const updatedUser = {
      ...oldUser,
      ...userData,
      Id: parseInt(id),
      permissions: roleData.permissions
    }

    this.data[index] = updatedUser
    
    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.Id === parseInt(id)) {
      this.currentUser = { ...updatedUser }
    }

    await auditService.logOperation(
      'user',
      parseInt(id),
      'update',
      { 
        username: updatedUser.username, 
        role: updatedUser.role,
        isActive: updatedUser.isActive 
      },
      oldUser,
      updatedUser
    )

    return { ...updatedUser }
  }

  async delete(id) {
    await this.delay(250)
    const index = this.data.findIndex(u => u.Id === parseInt(id))
    if (index === -1) {
      throw new Error("User not found")
    }

    const user = this.data[index]
    
    // Prevent deleting the current user
    if (this.currentUser && this.currentUser.Id === parseInt(id)) {
      throw new Error("Cannot delete your own account")
    }

    // Prevent deleting the last admin
    const adminUsers = this.data.filter(u => u.role === "Admin" && u.Id !== parseInt(id))
    if (user.role === "Admin" && adminUsers.length === 0) {
      throw new Error("Cannot delete the last administrator")
    }

    this.data.splice(index, 1)
    
    await auditService.logOperation(
      'user',
      parseInt(id),
      'delete',
      null,
      user,
      null
    )

    return true
  }

  async search(query, filters = {}) {
    await this.delay(200)
    let results = [...this.data]

    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.department?.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.role && filters.role !== 'all') {
      results = results.filter(user => user.role === filters.role)
    }

    if (filters.isActive !== undefined) {
      results = results.filter(user => user.isActive === filters.isActive)
    }

    if (filters.department && filters.department !== 'all') {
      results = results.filter(user => user.department === filters.department)
    }

    return results
  }

  async changePassword(userId, oldPassword, newPassword) {
    await this.delay(300)
    const user = this.data.find(u => u.Id === parseInt(userId))
    if (!user) {
      throw new Error("User not found")
    }

    // In a real app, you'd verify the old password hash
    // For demo purposes, we'll just simulate the change
    
    await auditService.logOperation(
      'user',
      parseInt(userId),
      'password_change',
      { username: user.username },
      null,
      null
    )

    return true
  }

  async resetPassword(userId, newPassword) {
    await this.delay(300)
    const user = this.data.find(u => u.Id === parseInt(userId))
    if (!user) {
      throw new Error("User not found")
    }

    // In a real app, you'd hash the new password
    
    await auditService.logOperation(
      'user',
      parseInt(userId),
      'password_reset',
      { username: user.username, resetBy: this.currentUser?.username },
      null,
      null
    )

    return true
  }

  async toggleUserStatus(id) {
    await this.delay(200)
    const user = this.data.find(u => u.Id === parseInt(id))
    if (!user) {
      throw new Error("User not found")
    }

    // Prevent deactivating your own account
    if (this.currentUser && this.currentUser.Id === parseInt(id)) {
      throw new Error("Cannot deactivate your own account")
    }

    const oldStatus = user.isActive
    user.isActive = !user.isActive

    await auditService.logOperation(
      'user',
      parseInt(id),
      user.isActive ? 'activate' : 'deactivate',
      { username: user.username, status: user.isActive },
      { isActive: oldStatus },
      { isActive: user.isActive }
    )

    return { ...user }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new UserService()