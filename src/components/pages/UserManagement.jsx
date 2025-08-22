import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import { toast } from "react-toastify"
import userService from "@/services/api/userService"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import FormField from "@/components/molecules/FormField"
import StatusBadge from "@/components/molecules/StatusBadge"
import DataTable from "@/components/organisms/DataTable"
import Empty from "@/components/ui/Empty"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { useAuth } from "@/contexts/AuthContext"

const UserManagement = () => {
  const { hasPermission, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [filters, setFilters] = useState({
    role: 'all',
    isActive: undefined,
    department: 'all'
  })

  useEffect(() => {
    if (!hasPermission('users_manage')) {
      setError('You do not have permission to access user management')
      setLoading(false)
      return
    }
    
    loadData()
    loadRoles()
  }, [hasPermission])

  const loadData = async () => {
    try {
      setError(null)
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = () => {
    const roleData = userService.getRoles()
    setRoles(roleData)
  }

  const handleSearch = async (query = searchTerm) => {
    try {
      const results = await userService.search(query, filters)
      setUsers(results)
    } catch (err) {
      toast.error("Failed to search users")
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.username?.trim()) {
        toast.error("Username is required")
        return
      }
      if (!formData.email?.trim()) {
        toast.error("Email is required")
        return
      }
      if (!formData.firstName?.trim()) {
        toast.error("First name is required")
        return
      }
      if (!formData.role) {
        toast.error("Role is required")
        return
      }

      if (editingUser) {
        await userService.update(editingUser.Id, formData)
        toast.success("User updated successfully")
      } else {
        await userService.create(formData)
        toast.success("User created successfully")
      }
      
      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return
    }

    try {
      await userService.delete(user.Id)
      toast.success("User deleted successfully")
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleUserStatus(user.Id)
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (!passwordData.oldPassword) {
        toast.error("Current password is required")
        return
      }
      if (!passwordData.newPassword) {
        toast.error("New password is required")
        return
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }
      if (passwordData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }

      const targetUserId = editingUser?.Id || currentUser?.Id
      await userService.changePassword(targetUserId, passwordData.oldPassword, passwordData.newPassword)
      toast.success("Password changed successfully")
      setShowPasswordForm(false)
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleResetPassword = async (user) => {
    if (!confirm(`Reset password for user "${user.username}"?`)) {
      return
    }

    try {
      const tempPassword = Math.random().toString(36).slice(-8)
      await userService.resetPassword(user.Id, tempPassword)
      toast.success(`Password reset successfully. Temporary password: ${tempPassword}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({})
  }

  const getDepartments = () => {
    const departments = [...new Set(users.map(u => u.department).filter(Boolean))]
    return departments
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filters.role === 'all' || user.role === filters.role
    const matchesStatus = filters.isActive === undefined || user.isActive === filters.isActive
    const matchesDepartment = filters.department === 'all' || user.department === filters.department

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const columns = [
    { key: "username", label: "Username" },
    { 
      key: "name", 
      label: "Name", 
      render: (_, user) => `${user.firstName} ${user.lastName || ''}`.trim()
    },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <StatusBadge 
          status={value ? "active" : "inactive"} 
          variant={value ? "success" : "error"}
        >
          {value ? "Active" : "Inactive"}
        </StatusBadge>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => value 
        ? new Date(value).toLocaleDateString() 
        : "Never"
    }
  ]

  if (!hasPermission('users_manage')) {
    return (
      <Error 
        message="You do not have permission to access user management"
        showRetry={false}
      />
    )
  }

  if (loading) return <Loading rows={6} />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ApperIcon name="Users" className="w-8 h-8 mr-3 text-primary-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPasswordForm(true)}
          >
            <ApperIcon name="Key" className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value)
                handleSearch(value)
              }}
              placeholder="Search users..."
              className="flex-1 min-w-64"
            />
            
            <FormField
              label=""
              type="select"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              options={[
                { value: "all", label: "All Roles" },
                ...roles.map(role => ({ value: role.name, label: role.name }))
              ]}
              className="w-40"
            />

            <FormField
              label=""
              type="select"
              value={filters.isActive?.toString() || "all"}
              onChange={(e) => setFilters({...filters, isActive: e.target.value === "all" ? undefined : e.target.value === "true"})}
              options={[
                { value: "all", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" }
              ]}
              className="w-40"
            />

            <FormField
              label=""
              type="select"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              options={[
                { value: "all", label: "All Departments" },
                ...getDepartments().map(dept => ({ value: dept, label: dept }))
              ]}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <DataTable
              data={filteredUsers}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchable={false}
              actions={(user) => (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={user.isActive ? "warning" : "success"}
                    onClick={() => handleToggleStatus(user)}
                  >
                    <ApperIcon 
                      name={user.isActive ? "UserX" : "UserCheck"} 
                      className="w-4 h-4" 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResetPassword(user)}
                    title="Reset Password"
                  >
                    <ApperIcon name="KeyRound" className="w-4 h-4" />
                  </Button>
                </div>
              )}
            />
          ) : (
            <Empty
              title="No users found"
              description="No users match your current search and filters"
              icon="Users"
            />
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingUser ? "Edit User" : "Create User"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <FormField
                label="Username"
                value={formData.username || ""}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                disabled={!!editingUser}
              />
              
              <FormField
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="First Name"
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                
                <FormField
                  label="Last Name"
                  value={formData.lastName || ""}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>

              <FormField
                label="Role"
                type="select"
                value={formData.role || ""}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                options={roles.map(role => ({ 
                  value: role.name, 
                  label: `${role.name} - ${role.description}` 
                }))}
                required
              />

              <FormField
                label="Phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />

              <FormField
                label="Department"
                value={formData.department || ""}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm">Active User</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <FormField
                label="Current Password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                required
              />
              
              <FormField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />

              <FormField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handlePasswordChange}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UserManagement