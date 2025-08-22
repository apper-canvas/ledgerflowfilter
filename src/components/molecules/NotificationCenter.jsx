import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import NotificationBadge from "@/components/atoms/NotificationBadge"
import { Card, CardContent } from "@/components/atoms/Card"
import { notificationService } from "@/services/api/notificationService"
import { cn } from "@/utils/cn"

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationService.getAll()
      setNotifications(data.slice(0, 5)) // Show only recent 5
    } catch (error) {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error("Failed to get unread count:", error)
    }
  }

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.Id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev => 
          prev.map(n => 
            n.Id === notification.Id ? { ...n, isRead: true } : n
          )
        )
      }
      
      setIsOpen(false)
      
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
      
      toast.success("Notification opened")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    navigate("/notifications")
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return "AlertTriangle"
      case "reminder":
        return "Clock"
      case "system":
        return "Settings"
      default:
        return "Info"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-error"
      case "medium":
        return "text-warning"
      default:
        return "text-gray-500"
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ApperIcon name="Bell" className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <NotificationBadge count={unreadCount} size="small" />
          </div>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <ApperIcon name="Loader2" className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <ApperIcon name="Bell" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.Id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                        !notification.isRead && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          notification.type === "alert" && "bg-red-100",
                          notification.type === "reminder" && "bg-yellow-100",
                          notification.type === "system" && "bg-blue-100",
                          notification.type === "info" && "bg-green-100"
                        )}>
                          <ApperIcon
                            name={getNotificationIcon(notification.type)}
                            className={cn(
                              "w-4 h-4",
                              getPriorityColor(notification.priority)
                            )}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.isRead ? "text-gray-900" : "text-gray-700"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.category && (
                              <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                {notification.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAll}
                  className="w-full text-primary-600 hover:text-primary-700"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter