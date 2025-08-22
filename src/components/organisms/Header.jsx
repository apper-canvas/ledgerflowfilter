import React from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import NotificationCenter from "@/components/molecules/NotificationCenter"
const Header = ({ onMenuClick }) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

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
        </div>
      </div>
    </header>
  )
}

export default Header