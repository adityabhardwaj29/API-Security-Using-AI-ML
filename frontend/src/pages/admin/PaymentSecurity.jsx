import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const PaymentSecurity = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPaymentSecurity = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/admin/payments');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch payment security telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentSecurity();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
        Loading UPI Payment Security Telemetry...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SOC Telemetry & Risk Intelligence
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            UPI Payment Security Center
          </h1>
        </div>

        <button
          onClick={fetchPaymentSecurity}
          className="btn btn-secondary btn-sm"
          style={{ background: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* KPI Cards Grid (Section 32) */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-title">Total UPI Transactions</div>
          <div className="metric-value">{stats?.total_transactions || 0}</div>
          <div className="metric-subtitle">Volume: ₹{(stats?.total_volume_inr || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="metric-card success">
          <div className="metric-title" style={{ color: '#059669' }}>Verified & Completed</div>
          <div className="metric-value" style={{ color: '#059669' }}>{stats?.verified_count || 0}</div>
          <div className="metric-subtitle">Clean behavioral evaluation</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-title" style={{ color: '#d97706' }}>Flagged / Verification Challenge</div>
          <div className="metric-value" style={{ color: '#d97706' }}>{stats?.flagged_count || 0}</div>
          <div className="metric-subtitle">MFA Step-up challenge enforced</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-title" style={{ color: '#e11d48' }}>Blocked / Security Held</div>
          <div className="metric-value" style={{ color: '#e11d48' }}>{stats?.held_count || 0}</div>
          <div className="metric-subtitle">High anomaly score hold placed</div>
        </div>
      </div>

      {/* Two Column Layout: Risk Distribution & Recent Payment Threats */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Payment Risk Distribution */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#0066ff" />
            <span>Transaction Risk Classification</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span style={{ color: '#059669' }}>LOW RISK (Auto Approved)</span>
                <span style={{ color: '#0f172a' }}>{stats?.risk_distribution?.LOW || 0} txns</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stats?.risk_distribution?.LOW || 0) / Math.max(stats?.total_transactions || 1, 1) * 100, 100)}%`,
                  background: '#10b981',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span style={{ color: '#d97706' }}>MEDIUM RISK (Monitored)</span>
                <span style={{ color: '#0f172a' }}>{stats?.risk_distribution?.MEDIUM || 0} txns</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stats?.risk_distribution?.MEDIUM || 0) / Math.max(stats?.total_transactions || 1, 1) * 100, 100)}%`,
                  background: '#f59e0b',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span style={{ color: '#e11d48' }}>HIGH RISK (Step-Up Challenge)</span>
                <span style={{ color: '#0f172a' }}>{stats?.risk_distribution?.HIGH || 0} txns</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stats?.risk_distribution?.HIGH || 0) / Math.max(stats?.total_transactions || 1, 1) * 100, 100)}%`,
                  background: '#f43f5e',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span style={{ color: '#be123c' }}>CRITICAL RISK (Held/Blocked)</span>
                <span style={{ color: '#0f172a' }}>{stats?.risk_distribution?.CRITICAL || 0} txns</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stats?.risk_distribution?.CRITICAL || 0) / Math.max(stats?.total_transactions || 1, 1) * 100, 100)}%`,
                  background: '#be123c',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payment Threats */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#e11d48" />
            <span>Recent Payment Security Threats</span>
          </h3>

          {(!stats?.recent_threats || stats.recent_threats.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
              No active payment threats detected. All transactions normal.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recent_threats.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: '#be123c', fontSize: '0.875rem' }}>
                      {t.threat_type}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      User #{t.user_id} • Score: {t.anomaly_score * 100}% • {new Date(t.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <Link
                    to={`/admin/threats/${t.id}`}
                    className="btn btn-sm"
                    style={{ background: '#e11d48', color: '#ffffff', fontSize: '0.75rem' }}
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Transaction Audit Table */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} color="#0066ff" />
          <span>Real-Time UPI Payment Telemetry</span>
        </h3>

        {(!stats?.recent_transactions || stats.recent_transactions.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No payment transaction logs available.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Ref</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>User</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Amount</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Method / UPI ID</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Status</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Risk Level</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0066ff', fontSize: '0.825rem' }}>
                      {txn.transaction_reference || `UPI-${txn.id}`}
                    </td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>
                      {txn.user_name}
                    </td>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      ₹{txn.amount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                      {txn.payment_method} ({txn.upi_id})
                    </td>
                    <td>
                      <StatusBadge status={txn.status} />
                    </td>
                    <td>
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} />
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(txn.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
