import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CustomFieldDesigner from "@/components/pages/CustomFieldDesigner";
import CompanySetup from "@/components/pages/CompanySetup";
import Inventory from "@/components/pages/Inventory";
import Settings from "@/components/pages/Settings";
import VoucherEntry from "@/components/pages/VoucherEntry";
import VoucherDetails from "@/components/pages/VoucherDetails";
import Dashboard from "@/components/pages/Dashboard";
import BatchSerialManagement from "@/components/pages/BatchSerialManagement";
import Reports from "@/components/pages/Reports";
import Masters from "@/components/pages/Masters";
import CurrencyRateManager from "@/components/pages/CurrencyRateManager";
import BankStatementImport from "@/components/pages/BankStatementImport";
import Layout from "@/components/organisms/Layout";

function App() {
return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="voucher-entry/:type?" element={<VoucherEntry />} />
            <Route path="masters/:section?" element={<Masters />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/batch-serial" element={<BatchSerialManagement />} />
            <Route path="reports/:type?" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="company-setup" element={<CompanySetup />} />
<Route path="masters/custom-fields" element={<CustomFieldDesigner />} />
<Route path="currency-rates" element={<CurrencyRateManager />} />
            <Route path="bank-statements" element={<BankStatementImport />} />
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
    </>
  )
}

export default App