import React from "react"
import { useParams } from "react-router-dom"
import VoucherForm from "@/components/organisms/VoucherForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const VoucherEntry = () => {
  const { type } = useParams()
  const voucherType = type || "journal"

  const voucherIcons = {
    sales: "ShoppingCart",
    purchase: "ShoppingBag", 
    payment: "CreditCard",
    receipt: "Banknote",
    contra: "RefreshCw",
    journal: "BookOpen"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <ApperIcon 
              name={voucherIcons[voucherType]} 
              className="w-6 h-6 text-primary-700" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {voucherType} Entry
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage {voucherType} vouchers with keyboard shortcuts
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard Help */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">
            <ApperIcon name="Keyboard" className="w-4 h-4 mr-2 inline" />
            Keyboard Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-800">
            <div><kbd className="kbd mr-1">Tab</kbd> Next field</div>
            <div><kbd className="kbd mr-1">Shift+Tab</kbd> Previous field</div>
            <div><kbd className="kbd mr-1">Ctrl+S</kbd> Save voucher</div>
            <div><kbd className="kbd mr-1">Ctrl+N</kbd> New entry</div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher Form */}
      <VoucherForm type={voucherType} />
    </div>
  )
}

export default VoucherEntry