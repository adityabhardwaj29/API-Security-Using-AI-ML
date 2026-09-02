import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  CreditCard,
  Network,
  Users,
  Activity,
  Cpu,
  PlaySquare,
  Settings,
  LogOut,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import { ThreatAlertBanner } from '../components/ThreatAlertBanner';

export const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { latestThreat, clearLatestThreat, isConnected } = useRealtime();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Live Threat Notification Toast */}
      <ThreatAlertBanner threat={latestThreat} onDismiss={clearLatestThreat} />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0066ff, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 14px rgba(0, 102, 255, 0.35)',
          }}>
            <Shield size={20} />
          </div>
          <div className="sidebar-brand">
            <span>API SECURITY</span>
            <span className="sidebar-tag">SOC OPERATIONS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>SOC Overview</span>
          </NavLink>

          <NavLink to="/admin/threats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={18} />
            <span>Live Threat Monitor</span>
          </NavLink>

          <NavLink to="/admin/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={18} />
            <span>Payment Security</span>
          </NavLink>

          <NavLink to="/admin/graph" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Network size={18} />
            <span>API Flow Graph</span>
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>User Investigation</span>
          </NavLink>

          <NavLink to="/admin/apis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={18} />
            <span>API Telemetry</span>
          </NavLink>

          <NavLink to="/admin/models" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Cpu size={18} />
            <span>ML / GNN Hub</span>
          </NavLink>

          <NavLink to="/admin/simulator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PlaySquare size={18} />
            <span>Attack Simulator</span>
          </NavLink>

          <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>SOC Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0066ff',
              fontSize: '0.8125rem',
              fontWeight: '700',
              marginBottom: '0.85rem',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Storefront (₹)</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border)' }}>
            <div style={{ fontSize: '0.8125rem', color: '#0f172a', fontWeight: '700' }}>
              {user ? user.name.split(' ')[0] : 'Admin'}
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
              style={{ padding: '0.3rem 0.5rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#e11d48' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="soc-status-indicator">
              <div className="status-dot" style={{ backgroundColor: isConnected ? '#10b981' : '#f59e0b' }} />
              <span>{isConnected ? 'LIVE WEBSOCKET STREAM ACTIVE' : 'RECONNECTING STREAM...'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: '#64748b' }}>
            <span>Market: <strong style={{ color: '#0066ff' }}>INR (₹) E-Commerce</strong></span>
            <span>Defense: <strong style={{ color: '#059669' }}>AI/ML & GNN Active</strong></span>
          </div>
        </header>

        <main style={{ padding: '1.75rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
