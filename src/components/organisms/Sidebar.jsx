import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "LayoutDashboard", shortcut: "Alt+D" },
    { 
      path: "/voucher-entry", 
      label: "Voucher Entry", 
      icon: "FileEdit", 
      shortcut: "F2",
      children: [
        { path: "/voucher-entry/sales", label: "Sales", shortcut: "F4" },
        { path: "/voucher-entry/purchase", label: "Purchase", shortcut: "F5" },
        { path: "/voucher-entry/payment", label: "Payment", shortcut: "F6" },
        { path: "/voucher-entry/receipt", label: "Receipt", shortcut: "F7" },
        { path: "/voucher-entry/contra", label: "Contra", shortcut: "F8" },
        { path: "/voucher-entry/journal", label: "Journal", shortcut: "F9" }
      ]
    },
    { 
      path: "/masters", 
      label: "Masters", 
      icon: "Database", 
      shortcut: "Alt+M",
children: [
        { path: "/masters/ledgers", label: "Ledgers" },
        { path: "/masters/groups", label: "Groups" },
        { path: "/masters/custom-fields", label: "Custom Fields" },
        { path: "/masters/cost-centers", label: "Cost Centers" },
        { path: "/masters/currencies", label: "Currencies" },
        { path: "/users", label: "User Management" },
        { path: "/notifications", label: "Notifications" },
{ path: "/bank-statements", label: "Bank Statements" },
        { path: "/audit-logs", label: "Audit Logs" }
      ]
    },
    { path: "/inventory", label: "Inventory", icon: "Package", shortcut: "Alt+I" },
    { 
      path: "/reports",
      label: "Reports", 
      icon: "BarChart3", 
      shortcut: "Alt+R",
children: [
        { path: "/reports/trial-balance", label: "Trial Balance" },
        { path: "/reports/profit-loss", label: "P&L Statement" },
        { path: "/reports/balance-sheet", label: "Balance Sheet" },
        { path: "/reports/ledger", label: "Ledger Report" },
        { path: "/reports/daybook", label: "Day Book" },
        { path: "/reports/analytics", label: "Financial Analytics" }
      ]
    },
    { path: "/settings", label: "Settings", icon: "Settings", shortcut: "Alt+S" }
  ]

  const isActiveItem = (item) => {
    if (item.path === "/" && location.pathname === "/") return true
    if (item.path !== "/" && location.pathname.startsWith(item.path)) return true
    return false
  }

  const renderMenuItem = (item) => (
    <div key={item.path}>
      <NavLink
        to={item.path}
        onClick={onClose}
        className={({ isActive }) => cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
          isActive || isActiveItem(item)
            ? "bg-primary-700 text-white"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <kbd className="hidden lg:inline-block kbd text-xs">{item.shortcut}</kbd>
        )}
      </NavLink>
      
      {item.children && isActiveItem(item) && (
        <div className="ml-6 mt-2 space-y-1">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="flex-1">{child.label}</span>
              {child.shortcut && (
                <kbd className="hidden lg:inline-block kbd text-xs">{child.shortcut}</kbd>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-700 to-primary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calculator" className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">LedgerFlow</span>
          </div>
          <button onClick={onClose} className="lg:hidden">
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map(renderMenuItem)}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Offline Mode</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <button className="text-xs text-primary-700 hover:underline mt-1">
            Sync Now
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar