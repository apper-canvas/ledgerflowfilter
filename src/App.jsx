import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import Dashboard from "@/components/pages/Dashboard"
import VoucherEntry from "@/components/pages/VoucherEntry"
import Masters from "@/components/pages/Masters"
import Inventory from "@/components/pages/Inventory"
import Reports from "@/components/pages/Reports"
import Settings from "@/components/pages/Settings"
import CompanySetup from "@/components/pages/CompanySetup"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="voucher-entry/:type?" element={<VoucherEntry />} />
            <Route path="masters/:section?" element={<Masters />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports/:type?" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="company-setup" element={<CompanySetup />} />
          </Route>
        </Routes>
      </Router>
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