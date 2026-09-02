import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layouts
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

// User Pages
import { Home } from './pages/user/Home';
import { Login } from './pages/user/Login';
import { Register } from './pages/user/Register';
import { Dashboard } from './pages/user/Dashboard';
import { Products } from './pages/user/Products';
import { Cart } from './pages/user/Cart';
import { Checkout } from './pages/user/Checkout';
import { Payment } from './pages/user/Payment';
import { Transactions } from './pages/user/Transactions';
import { Profile } from './pages/user/Profile';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { SOCDashboard } from './pages/admin/SOCDashboard';
import { ThreatMonitor } from './pages/admin/ThreatMonitor';
import { ThreatDetail } from './pages/admin/ThreatDetail';
import { PaymentSecurity } from './pages/admin/PaymentSecurity';
import { UserInvestigation } from './pages/admin/UserInvestigation';
import { APIMonitor } from './pages/admin/APIMonitor';
import { FlowGraphPage } from './pages/admin/FlowGraphPage';
import { ModelHub } from './pages/admin/ModelHub';
import { TrafficSimulator } from './pages/admin/TrafficSimulator';
import { AdminSettings } from './pages/admin/AdminSettings';

// Route Guards
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Verifying security session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Verifying SOC credentials...</div>;
  }
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Application Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="products" element={<Products />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path="dashboard"
              element={
                <ProtectedUserRoute>
                  <Dashboard />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <ProtectedUserRoute>
                  <Checkout />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="payment"
              element={
                <ProtectedUserRoute>
                  <Payment />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedUserRoute>
                  <Transactions />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedUserRoute>
                  <Profile />
                </ProtectedUserRoute>
              }
            />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin SOC Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<SOCDashboard />} />
            <Route path="threats" element={<ThreatMonitor />} />
            <Route path="threats/:id" element={<ThreatDetail />} />
            <Route path="payments" element={<PaymentSecurity />} />
            <Route path="users" element={<UserInvestigation />} />
            <Route path="users/:userId" element={<UserInvestigation />} />
            <Route path="apis" element={<APIMonitor />} />
            <Route path="graph" element={<FlowGraphPage />} />
            <Route path="models" element={<ModelHub />} />
            <Route path="simulator" element={<TrafficSimulator />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
