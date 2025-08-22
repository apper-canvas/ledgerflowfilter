import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const CompanySetup = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [companyData, setCompanyData] = useState({
    name: "",
    gstin: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: ""
    },
    financialYearStart: new Date().getFullYear() + "-04-01",
    baseCurrency: "INR",
    businessType: ""
  })

  const [selectedTemplate, setSelectedTemplate] = useState("")

  const businessTypes = [
    { value: "trading", label: "Trading Business", description: "Buy and sell goods" },
    { value: "manufacturing", label: "Manufacturing", description: "Produce and sell goods" },
    { value: "services", label: "Service Business", description: "Provide services to clients" },
    { value: "retail", label: "Retail Business", description: "Direct sales to consumers" }
  ]

  const coaTemplates = [
    {
      id: "standard",
      name: "Standard Indian COA",
      description: "Standard chart of accounts for Indian businesses",
      accounts: ["Cash", "Bank", "Sales", "Purchase", "Expenses", "Capital"]
    },
    {
      id: "trading",
      name: "Trading Business",
      description: "Optimized for trading companies",
      accounts: ["Cash", "Bank", "Sales", "Purchase", "Stock", "Debtors", "Creditors"]
    },
    {
      id: "services",
      name: "Service Business",
      description: "Designed for service providers",
      accounts: ["Cash", "Bank", "Service Income", "Operating Expenses", "Professional Fees"]
    }
  ]

  const handleNext = () => {
    if (step === 1) {
      if (!companyData.name || !companyData.address.city) {
        toast.error("Please fill in required company details")
        return
      }
    }
    setStep(step + 1)
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleFinish = async () => {
    try {
      // Save company data
      localStorage.setItem("companyData", JSON.stringify(companyData))
      localStorage.setItem("selectedCOATemplate", selectedTemplate)
      
      toast.success("Company setup completed successfully!")
      navigate("/")
    } catch (error) {
      toast.error("Failed to complete setup")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="Calculator" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LedgerFlow</h1>
          <p className="text-gray-600">Let's set up your accounting system</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum 
                    ? "bg-primary-700 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNum ? "bg-primary-700" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            <span>Company Info</span>
            <span>Business Type</span>
            <span>Chart of Accounts</span>
          </div>
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Company Name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Enter your company name"
                  required
                />
                
                <FormField
                  label="GSTIN (Optional)"
                  value={companyData.gstin}
                  onChange={(e) => setCompanyData({...companyData, gstin: e.target.value})}
                  placeholder="27ABCDE1234F1Z5"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Business Address</h4>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    label="Address Line 1"
                    value={companyData.address.line1}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: {...companyData.address, line1: e.target.value}
                    })}
                    placeholder="Street address, building number"
                  />
                  
                  <FormField
                    label="Address Line 2"
                    value={companyData.address.line2}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: {...companyData.address, line2: e.target.value}
                    })}
                    placeholder="Area, locality"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="City"
                      value={companyData.address.city}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, city: e.target.value}
                      })}
                      placeholder="City"
                      required
                    />
                    
                    <FormField
                      label="State"
                      type="select"
                      value={companyData.address.state}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, state: e.target.value}
                      })}
                      options={[
                        { value: "", label: "Select State" },
                        { value: "Maharashtra", label: "Maharashtra" },
                        { value: "Karnataka", label: "Karnataka" },
                        { value: "Tamil Nadu", label: "Tamil Nadu" },
                        { value: "Gujarat", label: "Gujarat" },
                        { value: "Delhi", label: "Delhi" }
                      ]}
                    />
                    
                    <FormField
                      label="PIN Code"
                      value={companyData.address.pincode}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, pincode: e.target.value}
                      })}
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Financial Year Start"
                  type="date"
                  value={companyData.financialYearStart}
                  onChange={(e) => setCompanyData({...companyData, financialYearStart: e.target.value})}
                />
                
                <FormField
                  label="Base Currency"
                  type="select"
                  value={companyData.baseCurrency}
                  onChange={(e) => setCompanyData({...companyData, baseCurrency: e.target.value})}
                  options={[
                    { value: "INR", label: "Indian Rupee (₹)" },
                    { value: "USD", label: "US Dollar ($)" },
                    { value: "EUR", label: "Euro (€)" }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Type */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setCompanyData({...companyData, businessType: type.value})}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      companyData.businessType === type.value
                        ? "border-primary-700 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Chart of Accounts */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Chart of Accounts Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coaTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-primary-700 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.accounts.map((account) => (
                            <span
                              key={account}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {account}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <ApperIcon name="Check" className="w-5 h-5 text-primary-700" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ApperIcon name="ChevronRight" className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              <ApperIcon name="Check" className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanySetup