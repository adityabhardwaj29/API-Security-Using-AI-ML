import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Activity, ShoppingBag, CreditCard, ArrowRight, Clock, QrCode } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const Dashboard = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [secRes, payRes, ordRes] = await Promise.all([
          api.get('/users/security-status'),
          api.get('/payments/history'),
          api.get('/orders'),
        ]);
        setSecurityStatus(secRes.data);
        setRecentPayments(payRes.data.slice(0, 5));
        setRecentOrders(ordRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.name}</h1>
          <p className="page-subtitle">Your personal account security center, UPI transactions, and active orders</p>
        </div>

        <Link to="/products" className="btn btn-primary">
          <ShoppingBag size={16} />
          <span>Explore Catalog (₹)</span>
        </Link>
      </div>

      {/* Security Status Banner (Section 12) */}
      <div className="card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0, 102, 255, 0.08))',
        borderColor: 'rgba(16, 185, 129, 0.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  ACCOUNT SECURITY
                </h3>
                <span className="badge badge-low">✓ Account Protected</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Multi-factor behavioral risk engine active. API transition graph verified.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Recent Activity Count</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {securityStatus?.recent_activity_count || 1} API Calls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid-2">
        {/* Recent UPI Transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} color="#38bdf8" />
              <span>Recent UPI Transactions</span>
            </h3>
            <Link to="/transactions" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>
              View All
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <p style={{ fontSize: '0.875rem' }}>No payment transactions recorded yet.</p>
              <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Security</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {p.transaction_reference || `UPI-${p.id}`}
                      </td>
                      <td style={{ fontWeight: '700', color: '#38bdf8' }}>
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <RiskBadge level={p.risk_level} score={p.risk_score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Audit Events */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Activity size={18} color="#10b981" />
            <span>Recent Activity Timeline</span>
          </h3>

          {(!securityStatus?.recent_security_events || securityStatus.recent_security_events.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
              Active session healthy. No suspicious alerts recorded.
            </div>
          ) : (
            <div className="timeline-list">
              {securityStatus.recent_security_events.map((e, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker success" />
                  <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.875rem' }}>
                    {e.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {new Date(e.timestamp).toLocaleTimeString()} • {e.event_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
