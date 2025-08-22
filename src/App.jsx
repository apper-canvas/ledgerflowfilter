import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/AuthContext";
import UserManagement from "@/components/pages/UserManagement";
import NotificationManager from "@/components/pages/NotificationManager";
import AuditLogs from "@/components/pages/AuditLogs";
import BankStatementImport from "@/components/pages/BankStatementImport";
import CustomFieldDesigner from "@/components/pages/CustomFieldDesigner";
import CompanySetup from "@/components/pages/CompanySetup";
import Inventory from "@/components/pages/Inventory";
import Settings from "@/components/pages/Settings";
import VoucherEntry from "@/components/pages/VoucherEntry";
import Dashboard from "@/components/pages/Dashboard";
import BatchSerialManagement from "@/components/pages/BatchSerialManagement";
import Reports from "@/components/pages/Reports";
import VoucherDetails from "@/components/pages/VoucherDetails";
import CurrencyRateManager from "@/components/pages/CurrencyRateManager";
import Masters from "@/components/pages/Masters";
import Layout from "@/components/organisms/Layout";

function App() {
return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="voucher-entry/:type?" element={<VoucherEntry />} />
<Route path="masters/:section?" element={<Masters />} />
            <Route path="inventory" element={<Inventory />} />
<Route path="inventory/batch-serial" element={<BatchSerialManagement />} />
            <Route path="reports/:type?" element={<Reports />} />
            <Route path="reports/analytics" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="company-setup" element={<CompanySetup />} />
<Route path="masters/custom-fields" element={<CustomFieldDesigner />} />
<Route path="currency-rates" element={<CurrencyRateManager />} />
<Route path="notifications" element={<NotificationManager />} />
<Route path="bank-statements" element={<BankStatementImport />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="voucher-details/:id" element={<VoucherDetails />} />
</Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
/>
    </AuthProvider>
  );
}

export default App;