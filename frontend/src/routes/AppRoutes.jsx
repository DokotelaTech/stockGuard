import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import useAuth from "../hooks/useAuth";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AIOrdering from "../pages/AIOrdering";
import BatchDetails from "../pages/BatchDetails";
import BlockchainTrace from "../pages/BlockchainTrace";
import Dashboard from "../pages/Dashboard";
import ExpiryAlerts from "../pages/ExpiryAlerts";
import Forecasts from "../pages/Forecasts";
import Inventory from "../pages/Inventory";
import ScanBatch from "../pages/ScanBatch";
import Transfers from "../pages/Transfers";

export default function AppRoutes() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={signIn} />
          )
        }
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        element={
          isAuthenticated ? (
            <DashboardLayout onLogout={signOut} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/scan" element={<ScanBatch />} />
        <Route path="/batches/:batchId" element={<BatchDetails />} />
        <Route path="/forecasts" element={<Forecasts />} />
        <Route path="/expiry" element={<ExpiryAlerts />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/blockchain" element={<BlockchainTrace />} />
        <Route path="/ordering" element={<AIOrdering />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
