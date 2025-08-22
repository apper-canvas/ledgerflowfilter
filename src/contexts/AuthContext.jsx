import React, { createContext, useContext, useEffect, useState } from 'react'
import userService from '@/services/api/userService'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    // Initialize with current user (in a real app, this would check localStorage/session)
    const initializeAuth = () => {
      try {
        const currentUser = userService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setPermissions(currentUser.permissions || [])
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const userData = await userService.login(username, password)
      setUser(userData)
      setPermissions(userData.permissions || [])
      toast.success(`Welcome back, ${userData.firstName}!`)
      return userData
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await userService.logout()
      setUser(null)
      setPermissions([])
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error during logout')
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (permissions.includes('all')) return true
    return permissions.includes(permission)
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.role === role)
  }

  const hasAnyPermission = (permissionsList) => {
    if (!user) return false
    if (permissions.includes('all')) return true
    return permissionsList.some(permission => permissions.includes(permission))
  }

  const isAdmin = () => {
    return user?.role === 'Admin'
  }

  const updateUserProfile = async (userData) => {
    if (!user) return

    try {
      const updatedUser = await userService.update(user.Id, userData)
      setUser(updatedUser)
      toast.success('Profile updated successfully')
      return updatedUser
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const value = {
    user,
    loading,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    isAdmin,
    updateUserProfile,
    isAuthenticated: !!user,
    isActive: user?.isActive || false
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext