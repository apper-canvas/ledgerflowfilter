import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import DataTable from "@/components/organisms/DataTable"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { notificationService } from "@/services/api/notificationService"
import { cn } from "@/utils/cn"

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, selectedType, selectedPriority, selectedStatus])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (error) {
      setError(error.message)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = [...notifications]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(term) ||
          n.message.toLowerCase().includes(term) ||
          n.category?.toLowerCase().includes(term)
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(n => n.type === selectedType)
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(n => n.priority === selectedPriority)
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "read") {
        filtered = filtered.filter(n => n.isRead)
      } else if (selectedStatus === "unread") {
        filtered = filtered.filter(n => !n.isRead)
      }
    }

    setFilteredNotifications(filtered)
  }

  const handleMarkAsRead = async (ids) => {
    try {
      const promises = ids.map(id => notificationService.markAsRead(id))
      await Promise.all(promises)
      
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.Id) ? { ...n, isRead: true } : n))
      )
      
      setSelectedItems([])
      toast.success(`Marked ${ids.length} notification(s) as read`)
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const handleMarkAsUnread = async (ids) => {
    try {
      const promises = ids.map(id => 
        notificationService.update(id, { isRead: false })
      )
      await Promise.all(promises)
      
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.Id) ? { ...n, isRead: false } : n))
      )
      
      setSelectedItems([])
      toast.success(`Marked ${ids.length} notification(s) as unread`)
    } catch (error) {
      toast.error("Failed to mark notifications as unread")
    }
  }

  const handleDelete = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} notification(s)?`)) {
      return
    }

    try {
      const promises = ids.map(id => notificationService.delete(id))
      await Promise.all(promises)
      
      setNotifications(prev => prev.filter(n => !ids.includes(n.Id)))
      setSelectedItems([])
      toast.success(`Deleted ${ids.length} notification(s)`)
    } catch (error) {
      toast.error("Failed to delete notifications")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
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

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "alert":
        return "bg-red-100 text-red-800"
      case "reminder":
        return "bg-yellow-100 text-yellow-800"
      case "system":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const columns = [
    {
      key: "selection",
      label: "",
      render: (notification) => (
        <input
          type="checkbox"
          checked={selectedItems.includes(notification.Id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems(prev => [...prev, notification.Id])
            } else {
              setSelectedItems(prev => prev.filter(id => id !== notification.Id))
            }
          }}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: "status",
      label: "Status",
      render: (notification) => (
        <div className="flex items-center">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
          )}
          <span className={cn(
            "text-sm",
            !notification.isRead ? "font-medium text-gray-900" : "text-gray-600"
          )}>
            {notification.isRead ? "Read" : "Unread"}
          </span>
        </div>
      )
    },
    {
      key: "title",
      label: "Title",
      render: (notification) => (
        <div className="flex items-start space-x-3">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
            notification.type === "alert" && "bg-red-100",
            notification.type === "reminder" && "bg-yellow-100",
            notification.type === "system" && "bg-blue-100",
            notification.type === "info" && "bg-green-100"
          )}>
            <ApperIcon
              name={getNotificationIcon(notification.type)}
              className="w-4 h-4 text-gray-600"
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "text-sm font-medium",
              !notification.isRead ? "text-gray-900" : "text-gray-700"
            )}>
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (notification) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
          getTypeBadgeColor(notification.type)
        )}>
          {notification.type}
        </span>
      )
    },
    {
      key: "priority",
      label: "Priority",
      render: (notification) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border",
          getPriorityBadgeColor(notification.priority)
        )}>
          {notification.priority}
        </span>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (notification) => (
        <span className="text-sm text-gray-600">
          {notification.category || "General"}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      render: (notification) => (
        <span className="text-sm text-gray-600">
          {formatDateTime(notification.createdAt)}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMarkAsRead([notification.Id])}
            disabled={notification.isRead}
            className="text-xs"
          >
            {notification.isRead ? "Read" : "Mark Read"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete([notification.Id])}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  if (loading) return <Loading rows={5} />
  if (error) return <Error message={error} onRetry={fetchNotifications} />

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    high: notifications.filter(n => n.priority === "high").length,
    alerts: notifications.filter(n => n.type === "alert").length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">Manage all your system notifications</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
            className="flex items-center"
          >
            <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ApperIcon name="Bell" className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-primary-600">{stats.unread}</p>
              </div>
              <ApperIcon name="BellRing" className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
              <ApperIcon name="AlertTriangle" className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.alerts}</p>
              </div>
              <ApperIcon name="AlertCircle" className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedItems)}
                >
                  Mark Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsUnread(selectedItems)}
                >
                  Mark Unread
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedItems)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="reminder">Reminders</option>
              <option value="system">System</option>
              <option value="info">Info</option>
            </Select>
            
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
          </div>

          <DataTable
            data={filteredNotifications}
            columns={columns}
            searchable={false}
            itemsPerPage={10}
            emptyMessage="No notifications found"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationManager