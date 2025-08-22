import React, { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import NotificationCenter from "@/components/molecules/NotificationCenter"
import { useAuth } from "@/contexts/AuthContext"
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric", 
    month: "long",
    day: "numeric"
  })

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Acme Enterprises Ltd.</h1>
              <p className="text-sm text-gray-600">{currentDate}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
            <span>FY: 2024-25</span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </span>
          </div>
          
<NotificationCenter />
          
          <Button variant="ghost" size="icon">
            <ApperIcon name="HelpCircle" className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-3"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-600">{user?.role}</div>
              </div>
              <ApperIcon name="ChevronDown" className="w-4 h-4" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowUserMenu(false)
                      // Navigate to profile (if implemented)
                    }}
                  >
                    <ApperIcon name="User" className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowUserMenu(false)
                      // Navigate to settings
                    }}
                  >
                    <ApperIcon name="Settings" className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <div className="border-t"></div>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <ApperIcon name="LogOut" className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header