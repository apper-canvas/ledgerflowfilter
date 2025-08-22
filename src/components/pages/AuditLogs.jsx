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
import auditService from "@/services/api/auditService"
import { cn } from "@/utils/cn"

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntityType, setSelectedEntityType] = useState("all")
  const [selectedOperation, setSelectedOperation] = useState("all")
  const [selectedUser, setSelectedUser] = useState("all")
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  })
  const [showDetails, setShowDetails] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    loadData()
    loadStats()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [auditLogs, searchTerm, selectedEntityType, selectedOperation, selectedUser, dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await auditService.getAll()
      setAuditLogs(data)
    } catch (error) {
      setError(error.message)
      toast.error("Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await auditService.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const filterLogs = async () => {
    try {
      const filters = {
        entityType: selectedEntityType,
        operation: selectedOperation,
        userId: selectedUser,
        dateRange: dateRange.from || dateRange.to ? dateRange : null
      }
      
      const filtered = await auditService.search(searchTerm, filters)
      setFilteredLogs(filtered)
    } catch (error) {
      console.error("Failed to filter logs:", error)
      setFilteredLogs(auditLogs)
    }
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const getOperationIcon = (operation) => {
    switch (operation) {
      case "create":
        return "Plus"
      case "update":
        return "Edit"
      case "delete":
        return "Trash2"
      default:
        return "Activity"
    }
  }

  const getOperationColor = (operation) => {
    switch (operation) {
      case "create":
        return "text-green-600"
      case "update":
        return "text-blue-600"
      case "delete":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getEntityTypeIcon = (entityType) => {
    switch (entityType) {
      case "voucher":
        return "FileText"
      case "ledger":
        return "BookOpen"
      case "group":
        return "FolderOpen"
      case "stockItem":
        return "Package"
      case "customField":
        return "Settings2"
      case "exchangeRate":
        return "DollarSign"
      case "notification":
        return "Bell"
      case "bankStatement":
        return "CreditCard"
      case "batchSerial":
        return "Hash"
      default:
        return "Database"
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  }

const formatEntityType = (entityType) => {
    if (!entityType || typeof entityType !== 'string') {
      return 'Unknown'
    }
    
    return entityType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const columns = [
    {
      key: "timestamp",
      label: "Date & Time",
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium">{formatTimestamp(log.timestamp)}</div>
          <div className="text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: "operation",
      label: "Operation",
      render: (log) => (
        <div className="flex items-center space-x-2">
          <ApperIcon 
            name={getOperationIcon(log.operation)} 
            className={cn("w-4 h-4", getOperationColor(log.operation))}
          />
          <span className={cn("capitalize font-medium", getOperationColor(log.operation))}>
            {log.operation}
          </span>
        </div>
      )
    },
    {
      key: "entityType",
      label: "Entity",
      render: (log) => (
        <div className="flex items-center space-x-2">
          <ApperIcon 
            name={getEntityTypeIcon(log.entityType)} 
            className="w-4 h-4 text-gray-600"
          />
          <div>
            <div className="font-medium">{formatEntityType(log.entityType)}</div>
            <div className="text-xs text-gray-500">ID: {log.entityId}</div>
          </div>
        </div>
      )
    },
    {
      key: "userName",
      label: "User",
      render: (log) => (
        <div>
          <div className="font-medium">{log.userName}</div>
          <div className="text-xs text-gray-500">{log.userId}</div>
        </div>
      )
    },
    {
      key: "changes",
      label: "Changes",
      render: (log) => {
        if (!log.changes && !log.oldValues && !log.newValues) {
          return <span className="text-gray-500 italic">No changes recorded</span>
        }
        
        const changeCount = log.changes ? Object.keys(log.changes).length : 0
        return (
          <div className="text-sm">
            {changeCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {changeCount} field{changeCount !== 1 ? 's' : ''} changed
              </span>
            )}
            {log.operation === "delete" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Record deleted
              </span>
            )}
            {log.operation === "create" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Record created
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (log) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(log)}
          className="text-primary-600 hover:text-primary-700"
        >
          <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
          Details
        </Button>
      )
    }
  ]

  const entityTypes = [
    { value: "all", label: "All Entities" },
    { value: "voucher", label: "Vouchers" },
    { value: "ledger", label: "Ledgers" },
    { value: "group", label: "Groups" },
    { value: "stockItem", label: "Stock Items" },
    { value: "customField", label: "Custom Fields" },
    { value: "exchangeRate", label: "Exchange Rates" },
    { value: "notification", label: "Notifications" },
    { value: "bankStatement", label: "Bank Statements" },
    { value: "batchSerial", label: "Batch/Serial" }
  ]

  const operations = [
    { value: "all", label: "All Operations" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" }
  ]

  const users = [
    { value: "all", label: "All Users" },
    { value: "user1", label: "Admin User" },
    { value: "user2", label: "Finance User" }
  ]

  if (loading) return <Loading rows={5} />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <ApperIcon name="Activity" className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system changes and user activities</p>
          </div>
        </div>
        
        <Button onClick={loadData}>
          <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <ApperIcon name="Database" className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.today || 0}</p>
              </div>
              <ApperIcon name="Calendar" className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-primary-600">{stats.last7Days || 0}</p>
              </div>
              <ApperIcon name="TrendingUp" className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Creates Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {auditLogs.filter(log => 
                    log.operation === 'create' && 
                    new Date(log.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <ApperIcon name="Plus" className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
            
            <Select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
            >
              {operations.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </Select>
            
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map(user => (
                <option key={user.value} value={user.value}>{user.label}</option>
              ))}
            </Select>
            
            <Input
              type="date"
              placeholder="From Date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            />
            
            <Input
              type="date"
              placeholder="To Date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Audit Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredLogs}
            columns={columns}
            searchable={false}
            itemsPerPage={20}
            emptyMessage="No audit logs found matching your filters"
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ApperIcon 
                      name={getOperationIcon(selectedLog.operation)} 
                      className={cn("w-5 h-5 mr-2", getOperationColor(selectedLog.operation))}
                    />
                    Audit Log Details
                  </CardTitle>
                  <Button variant="ghost" onClick={() => setShowDetails(false)}>
                    <ApperIcon name="X" className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Log Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {selectedLog.Id}</div>
                      <div><strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}</div>
                      <div><strong>Operation:</strong> 
                        <span className={cn("ml-1 capitalize font-medium", getOperationColor(selectedLog.operation))}>
                          {selectedLog.operation}
                        </span>
                      </div>
                      <div><strong>Entity Type:</strong> {formatEntityType(selectedLog.entityType)}</div>
                      <div><strong>Entity ID:</strong> {selectedLog.entityId}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>User:</strong> {selectedLog.userName}</div>
                      <div><strong>User ID:</strong> {selectedLog.userId}</div>
                      <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                      <div><strong>User Agent:</strong> 
                        <div className="mt-1 text-xs text-gray-600 break-all">
                          {selectedLog.userAgent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Changes */}
                {selectedLog.changes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Changes Made</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Old vs New Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedLog.oldValues && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Old Values</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <pre className="text-sm text-red-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.oldValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.newValues && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">New Values</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <pre className="text-sm text-green-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.newValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogs