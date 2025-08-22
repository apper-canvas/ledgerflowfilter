import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { formatCurrency } from "@/utils/formatters"

const VoucherDetails = ({ vouchers, onClose, title = "Voucher Details" }) => {
  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="FileX" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No vouchers found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="space-y-6">
            {vouchers.map((voucher) => (
              <Card key={voucher.Id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ApperIcon name="FileText" className="w-5 h-5 mr-2" />
                      {voucher.type.toUpperCase()} - {voucher.number}
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {new Date(voucher.date).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Details */}
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Type:</strong> {voucher.type}</div>
                        <div><strong>Number:</strong> {voucher.number}</div>
                        <div><strong>Date:</strong> {new Date(voucher.date).toLocaleDateString()}</div>
                        <div><strong>Status:</strong> {voucher.status}</div>
                        {voucher.narration && (
                          <div><strong>Narration:</strong> {voucher.narration}</div>
                        )}
                      </div>
                    </div>

                    {/* GST Details */}
                    {voucher.gstDetails && (
                      <div>
                        <h4 className="font-medium mb-2">GST Details</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>CGST:</strong> ₹{voucher.gstDetails.cgst?.toFixed(2) || '0.00'}</div>
                          <div><strong>SGST:</strong> ₹{voucher.gstDetails.sgst?.toFixed(2) || '0.00'}</div>
                          <div><strong>IGST:</strong> ₹{voucher.gstDetails.igst?.toFixed(2) || '0.00'}</div>
                          <div><strong>Total Tax:</strong> ₹{voucher.gstDetails.totalTax?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Entries */}
                  {voucher.entries && voucher.entries.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Ledger Entries</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">Ledger ID</th>
                              <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
                              <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {voucher.entries.map((entry, index) => (
                              <tr key={index}>
                                <td className="border border-gray-300 px-3 py-2">{entry.ledgerId}</td>
                                <td className="border border-gray-300 px-3 py-2 uppercase">
                                  {entry.type}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-right">
                                  ₹{entry.amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {voucher.customFields && Object.keys(voucher.customFields).length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Custom Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(voucher.customFields).map(([key, value]) => (
                          <div key={key}>
                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoucherDetails