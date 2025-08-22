import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company")
  const [companyData, setCompanyData] = useState({
    name: "Acme Enterprises Ltd.",
    gstin: "27ABCDE1234F1Z5",
    address: {
      line1: "123 Business Street",
      line2: "Commercial District",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    financialYearStart: "2024-04-01",
    baseCurrency: "INR"
  })

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 5,
    lastSync: new Date().toISOString(),
    serverUrl: "https://api.ledgerflow.com"
  })

  const [preferences, setPreferences] = useState({
    theme: "light",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "Indian",
    defaultVoucherType: "journal",
    showKeyboardShortcuts: true
  })

  const tabs = [
    { key: "company", label: "Company", icon: "Building" },
    { key: "sync", label: "Sync & Backup", icon: "Cloud" },
    { key: "preferences", label: "Preferences", icon: "Settings" },
    { key: "users", label: "Users & Access", icon: "Users" }
  ]

  const handleSaveCompany = () => {
    toast.success("Company settings saved successfully")
  }

  const handleSaveSync = () => {
    toast.success("Sync settings updated successfully")
  }

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully")
  }

  const handleSyncNow = () => {
    toast.info("Syncing data with cloud...")
    setTimeout(() => {
      setSyncSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }))
      toast.success("Data synced successfully")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <ApperIcon name="Settings" className="w-8 h-8 mr-3 text-primary-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your accounting preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center"
              >
                <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      {activeTab === "company" && (
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
                required
              />
              
              <FormField
                label="GSTIN"
                value={companyData.gstin}
                onChange={(e) => setCompanyData({...companyData, gstin: e.target.value})}
                placeholder="27ABCDE1234F1Z5"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  label="Address Line 1"
                  value={companyData.address.line1}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: {...companyData.address, line1: e.target.value}
                  })}
                />
                
                <FormField
                  label="Address Line 2"
                  value={companyData.address.line2}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: {...companyData.address, line2: e.target.value}
                  })}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="City"
                    value={companyData.address.city}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: {...companyData.address, city: e.target.value}
                    })}
                  />
                  
                  <FormField
                    label="State"
                    value={companyData.address.state}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: {...companyData.address, state: e.target.value}
                    })}
                  />
                  
                  <FormField
                    label="PIN Code"
                    value={companyData.address.pincode}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: {...companyData.address, pincode: e.target.value}
                    })}
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
                  { value: "EUR", label: "Euro (€)" },
                  { value: "GBP", label: "British Pound (£)" }
                ]}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveCompany}>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                Save Company Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Settings */}
      {activeTab === "sync" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-green-900">Connected to Cloud</p>
                    <p className="text-sm text-green-700">
                      Last synced: {new Date(syncSettings.lastSync).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleSyncNow}>
                  <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={syncSettings.autoSync}
                    onChange={(e) => setSyncSettings({...syncSettings, autoSync: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="autoSync" className="font-medium">Enable Auto Sync</label>
                </div>
                
                <FormField
                  label="Sync Interval (minutes)"
                  type="number"
                  value={syncSettings.syncInterval}
                  onChange={(e) => setSyncSettings({...syncSettings, syncInterval: parseInt(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>

              <FormField
                label="Server URL"
                value={syncSettings.serverUrl}
                onChange={(e) => setSyncSettings({...syncSettings, serverUrl: e.target.value})}
                placeholder="https://api.ledgerflow.com"
              />

              <div className="flex justify-end">
                <Button onClick={handleSaveSync}>
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  Save Sync Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-gray-600">Download your data as backup</p>
                </div>
                <Button variant="outline">
                  <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Import Data</p>
                  <p className="text-sm text-gray-600">Restore from backup file</p>
                </div>
                <Button variant="outline">
                  <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Theme"
                type="select"
                value={preferences.theme}
                onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                options={[
                  { value: "light", label: "Light Theme" },
                  { value: "dark", label: "Dark Theme" },
                  { value: "auto", label: "Auto (System)" }
                ]}
              />
              
              <FormField
                label="Date Format"
                type="select"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Number Format"
                type="select"
                value={preferences.numberFormat}
                onChange={(e) => setPreferences({...preferences, numberFormat: e.target.value})}
                options={[
                  { value: "Indian", label: "Indian (₹1,23,456.78)" },
                  { value: "International", label: "International (₹123,456.78)" }
                ]}
              />
              
              <FormField
                label="Default Voucher Type"
                type="select"
                value={preferences.defaultVoucherType}
                onChange={(e) => setPreferences({...preferences, defaultVoucherType: e.target.value})}
                options={[
                  { value: "journal", label: "Journal" },
                  { value: "sales", label: "Sales" },
                  { value: "purchase", label: "Purchase" },
                  { value: "payment", label: "Payment" },
                  { value: "receipt", label: "Receipt" }
                ]}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showKeyboardShortcuts"
                checked={preferences.showKeyboardShortcuts}
                onChange={(e) => setPreferences({...preferences, showKeyboardShortcuts: e.target.checked})}
                className="mr-3"
              />
              <label htmlFor="showKeyboardShortcuts" className="font-medium">
                Show Keyboard Shortcuts
              </label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSavePreferences}>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users & Access */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>Users & Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ApperIcon name="Lock" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Control</h3>
              <p className="text-gray-600 mb-6">
                This feature is not available in the current version. 
                All data is stored locally on your device.
              </p>
              <p className="text-sm text-gray-500">
                Upgrade to cloud version for multi-user access and role-based permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Settings