import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import KeyboardShortcut from "@/components/molecules/KeyboardShortcut"
import voucherService from "@/services/api/voucherService"
import ledgerService from "@/services/api/ledgerService"

const Dashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    summary: {
      totalVouchers: 0,
      totalLedgers: 0,
      pendingEntries: 0,
      lastSyncTime: null
    },
    recentVouchers: [],
    quickStats: {
      todayEntries: 0,
      monthlyRevenue: 0,
      pendingApprovals: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      const [vouchers, ledgers] = await Promise.all([
        voucherService.getAll(),
        ledgerService.getAll()
      ])

      const today = new Date().toDateString()
      const todayVouchers = vouchers.filter(v => 
        new Date(v.date).toDateString() === today
      )

      const recentVouchers = vouchers
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setData({
        summary: {
          totalVouchers: vouchers.length,
          totalLedgers: ledgers.length,
          pendingEntries: vouchers.filter(v => v.status === "draft").length,
          lastSyncTime: new Date()
        },
        recentVouchers,
        quickStats: {
          todayEntries: todayVouchers.length,
          monthlyRevenue: 0,
          pendingApprovals: 0
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { 
      label: "Sales Voucher", 
      path: "/voucher-entry/sales", 
      icon: "ShoppingCart", 
      shortcut: "F4",
      color: "bg-green-100 text-green-800 hover:bg-green-200"
    },
    { 
      label: "Purchase Voucher", 
      path: "/voucher-entry/purchase", 
      icon: "ShoppingBag", 
      shortcut: "F5",
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200"
    },
    { 
      label: "Payment Entry", 
      path: "/voucher-entry/payment", 
      icon: "CreditCard", 
      shortcut: "F6",
      color: "bg-red-100 text-red-800 hover:bg-red-200"
    },
    { 
      label: "Receipt Entry", 
      path: "/voucher-entry/receipt", 
      icon: "Banknote", 
      shortcut: "F7",
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }
  ]

  const reports = [
    { label: "Trial Balance", path: "/reports/trial-balance", icon: "Scale" },
    { label: "P&L Statement", path: "/reports/profit-loss", icon: "TrendingUp" },
    { label: "Balance Sheet", path: "/reports/balance-sheet", icon: "FileBarChart" },
    { label: "Day Book", path: "/reports/daybook", icon: "Calendar" }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to LedgerFlow</p>
        </div>
        
        <Button onClick={() => navigate("/voucher-entry")}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Voucher
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="FileText" className="w-6 h-6 text-primary-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vouchers</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalVouchers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="BookOpen" className="w-6 h-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ledger Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalLedgers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Clock" className="w-6 h-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.todayEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Wifi" className="w-6 h-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sync Status</p>
                <p className="text-sm font-bold text-green-600">Online</p>
                <p className="text-xs text-gray-500">Last sync: Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="ghost"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color}`}
                  onClick={() => navigate(action.path)}
                >
                  <ApperIcon name={action.icon} className="w-8 h-8" />
                  <span className="font-medium">{action.label}</span>
                  <kbd className="kbd text-xs">{action.shortcut}</kbd>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyboardShortcut keys="F2" description="New Voucher" />
            <KeyboardShortcut keys="F4" description="Sales Entry" />
            <KeyboardShortcut keys="F5" description="Purchase Entry" />
            <KeyboardShortcut keys="F6" description="Payment Entry" />
            <KeyboardShortcut keys="F7" description="Receipt Entry" />
            <KeyboardShortcut keys="Ctrl+S" description="Save Voucher" />
            <KeyboardShortcut keys="Ctrl+N" description="New Entry Line" />
            <KeyboardShortcut keys="Alt+R" description="Reports Menu" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentVouchers.map((voucher) => (
                <div key={voucher.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{voucher.type} #{voucher.number}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(voucher.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{voucher.entries?.reduce((sum, entry) => 
                      sum + (entry.type === "dr" ? entry.amount : 0), 0
                    ).toFixed(2)}</p>
                    <p className="text-xs text-gray-600 capitalize">{voucher.status || "posted"}</p>
                  </div>
                </div>
              ))}
              
              {data.recentVouchers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="FileX" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No vouchers found</p>
                  <p className="text-sm">Start by creating your first voucher</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => (
                <Button
                  key={report.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(report.path)}
                >
                  <ApperIcon name={report.icon} className="w-5 h-5 mr-3" />
                  {report.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard