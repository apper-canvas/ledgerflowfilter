import React, { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/organisms/Sidebar"
import Header from "@/components/organisms/Header"
import { useAuth } from "@/contexts/AuthContext"
import Loading from "@/components/ui/Loading"

const Layout = () => {
  const { loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSidebarOpen(false)
    }
    
    if (sidebarOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [sidebarOpen])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout