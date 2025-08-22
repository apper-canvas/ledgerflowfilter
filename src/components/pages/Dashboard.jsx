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
import ReactApexChart from "react-apexcharts"

const Dashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    summary: {
      totalVouchers: 0,
      totalLedgers: 0,
      pendingEntries: 0,
      lastSyncTime: null,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      cashFlow: 0
    },
    recentVouchers: [],
    quickStats: {
      todayEntries: 0,
      monthlyRevenue: 0,
      pendingApprovals: 0
    },
    chartData: {
      monthlyTrends: [],
      voucherDistribution: [],
      ledgerBalances: [],
      cashFlowData: []
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

      // Calculate financial metrics
      let totalRevenue = 0
      let totalExpenses = 0
      const monthlyData = {}
      const voucherTypeCount = {}
      
      vouchers.forEach(voucher => {
        const month = new Date(voucher.date).toLocaleString('default', { month: 'short', year: 'numeric' })
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, expenses: 0 }
        }
        
        // Count voucher types
        voucherTypeCount[voucher.type] = (voucherTypeCount[voucher.type] || 0) + 1
        
        if (voucher.entries) {
          voucher.entries.forEach(entry => {
            if (voucher.type === 'sales' || voucher.type === 'receipt') {
              totalRevenue += entry.amount || 0
              monthlyData[month].revenue += entry.amount || 0
            } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
              totalExpenses += entry.amount || 0
              monthlyData[month].expenses += entry.amount || 0
            }
          })
        }
      })

      // Prepare chart data
      const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses
      })).slice(-6)

      const voucherDistribution = Object.entries(voucherTypeCount).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      }))

      // Top ledgers by balance
      const ledgerBalances = ledgers
        .filter(ledger => ledger.currentBalance > 0)
        .sort((a, b) => b.currentBalance - a.currentBalance)
        .slice(0, 8)
        .map(ledger => ({
          name: ledger.name.length > 15 ? ledger.name.substring(0, 15) + '...' : ledger.name,
          balance: ledger.currentBalance || 0
        }))

      // Cash flow data (last 7 days)
      const cashFlowData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayVouchers = vouchers.filter(v => 
          new Date(v.date).toDateString() === date.toDateString()
        )
        
        let inflow = 0
        let outflow = 0
        dayVouchers.forEach(voucher => {
          if (voucher.entries) {
            voucher.entries.forEach(entry => {
              if (voucher.type === 'sales' || voucher.type === 'receipt') {
                inflow += entry.amount || 0
              } else if (voucher.type === 'purchase' || voucher.type === 'payment') {
                outflow += entry.amount || 0
              }
            })
          }
        })
        
        cashFlowData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          inflow,
          outflow
        })
      }

      setData({
        summary: {
          totalVouchers: vouchers.length,
          totalLedgers: ledgers.length,
          pendingEntries: vouchers.filter(v => v.status === "draft").length,
          lastSyncTime: new Date(),
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          cashFlow: totalRevenue - totalExpenses
        },
        recentVouchers,
        quickStats: {
          todayEntries: todayVouchers.length,
          monthlyRevenue: monthlyData[new Date().toLocaleString('default', { month: 'short', year: 'numeric' })]?.revenue || 0,
          pendingApprovals: 0
        },
        chartData: {
          monthlyTrends,
          voucherDistribution,
          ledgerBalances,
          cashFlowData
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
    { label: "Day Book", path: "/reports/daybook", icon: "Calendar" },
    { label: "Analytics", path: "/reports/analytics", icon: "BarChart3" }
  ]
  // Chart configurations
  const monthlyTrendsOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#28a745', '#dc3545'],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: {
      categories: data.chartData.monthlyTrends.map(item => item.month),
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        formatter: (value) => `₹${(value / 1000).toFixed(0)}K`,
        style: { fontSize: '12px' }
      }
    },
    tooltip: {
      y: { formatter: (value) => `₹${value.toLocaleString()}` }
    },
    legend: { position: 'top' },
    grid: { strokeDashArray: 3 }
  }

  const monthlyTrendsSeries = [
    {
      name: 'Revenue',
      data: data.chartData.monthlyTrends.map(item => item.revenue)
    },
    {
      name: 'Expenses',
      data: data.chartData.monthlyTrends.map(item => item.expenses)
    }
  ]

  const voucherDistributionOptions = {
    chart: { type: 'donut' },
    colors: ['#1976d2', '#28a745', '#dc3545', '#ffc107', '#17a2b8'],
    labels: data.chartData.voucherDistribution.map(item => item.type),
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (value) => `${value} vouchers` }
    }
  }

  const voucherDistributionSeries = data.chartData.voucherDistribution.map(item => item.count)

  const ledgerBalancesOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#1976d2'],
    xaxis: {
      categories: data.chartData.ledgerBalances.map(item => item.name),
      labels: { 
        rotate: -45,
        style: { fontSize: '11px' }
      }
    },
    yaxis: {
      labels: { 
        formatter: (value) => `₹${(value / 1000).toFixed(0)}K`,
        style: { fontSize: '12px' }
      }
    },
    tooltip: {
      y: { formatter: (value) => `₹${value.toLocaleString()}` }
    },
    plotOptions: {
      bar: { borderRadius: 4, dataLabels: { position: 'top' } }
    },
    dataLabels: { enabled: false }
  }

  const ledgerBalancesSeries = [{
    name: 'Balance',
    data: data.chartData.ledgerBalances.map(item => item.balance)
  }]

  const cashFlowOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    colors: ['#28a745', '#dc3545'],
    fill: { opacity: 0.3 },
    stroke: { width: 2 },
    xaxis: {
      categories: data.chartData.cashFlowData.map(item => item.date),
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        formatter: (value) => `₹${(value / 1000).toFixed(0)}K`,
        style: { fontSize: '12px' }
      }
    },
    tooltip: {
      y: { formatter: (value) => `₹${value.toLocaleString()}` }
    },
    legend: { position: 'top' }
  }

  const cashFlowSeries = [
    {
      name: 'Inflow',
      data: data.chartData.cashFlowData.map(item => item.inflow)
    },
    {
      name: 'Outflow',
      data: data.chartData.cashFlowData.map(item => item.outflow)
    }
  ]

  if (loading) return <Loading rows={4} />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Financial Analytics & Data Visualization</p>
        </div>
        
        <Button onClick={() => navigate("/voucher-entry")}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Voucher
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/reports/profit-loss")}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">₹{data.summary.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/reports/profit-loss")}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">₹{data.summary.totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-red-600">+5.2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/reports/profit-loss")}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                data.summary.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <ApperIcon name="DollarSign" className={`w-6 h-6 ${
                  data.summary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  data.summary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>₹{data.summary.netProfit.toLocaleString()}</p>
                <p className={`text-xs ${
                  data.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.summary.netProfit >= 0 ? '+' : ''}
                  {((data.summary.netProfit / data.summary.totalRevenue) * 100).toFixed(1)}% margin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/reports/daybook")}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Activity" className="w-6 h-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                <p className={`text-2xl font-bold ${
                  data.summary.cashFlow >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>₹{data.summary.cashFlow.toLocaleString()}</p>
                <p className="text-xs text-gray-600">{data.summary.totalVouchers} total transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue & Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="TrendingUp" className="w-5 h-5 mr-2 text-primary-700" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.chartData.monthlyTrends.length > 0 ? (
                <ReactApexChart
                  options={monthlyTrendsOptions}
                  series={monthlyTrendsSeries}
                  type="line"
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <ApperIcon name="BarChart3" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voucher Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="PieChart" className="w-5 h-5 mr-2 text-primary-700" />
              Voucher Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.chartData.voucherDistribution.length > 0 ? (
                <ReactApexChart
                  options={voucherDistributionOptions}
                  series={voucherDistributionSeries}
                  type="donut"
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <ApperIcon name="PieChart" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No vouchers found</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ledgers by Balance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ApperIcon name="BarChart" className="w-5 h-5 mr-2 text-primary-700" />
                Top Ledger Balances
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/masters/ledgers")}>
                <ApperIcon name="ArrowRight" className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.chartData.ledgerBalances.length > 0 ? (
                <ReactApexChart
                  options={ledgerBalancesOptions}
                  series={ledgerBalancesSeries}
                  type="bar"
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <ApperIcon name="BarChart" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No ledger data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ApperIcon name="Activity" className="w-5 h-5 mr-2 text-primary-700" />
                7-Day Cash Flow
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports/daybook")}>
                <ApperIcon name="ArrowRight" className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.chartData.cashFlowData.length > 0 ? (
                <ReactApexChart
                  options={cashFlowOptions}
                  series={cashFlowSeries}
                  type="area"
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <ApperIcon name="Activity" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No cash flow data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="ghost"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color}`}
                  onClick={() => navigate(action.path)}
                >
                  <ApperIcon name={action.icon} className="w-6 h-6" />
                  <span className="font-medium text-xs text-center">{action.label}</span>
                  <kbd className="kbd text-xs">{action.shortcut}</kbd>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vouchers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Vouchers</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/voucher-entry")}>
                <ApperIcon name="Plus" className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.recentVouchers.map((voucher) => (
                <div 
                  key={voucher.Id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/voucher-details/${voucher.Id}`)}
                >
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

        {/* Quick Reports & Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports & Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {reports.slice(0, 4).map((report) => (
                <Button
                  key={report.path}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate(report.path)}
                >
                  <ApperIcon name={report.icon} className="w-4 h-4 mr-2" />
                  {report.label}
                </Button>
              ))}
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</p>
              <div className="space-y-1">
                <KeyboardShortcut keys="F4" description="Sales Entry" />
                <KeyboardShortcut keys="F5" description="Purchase Entry" />
                <KeyboardShortcut keys="Alt+R" description="Reports" />
                <KeyboardShortcut keys="Alt+M" description="Masters" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard