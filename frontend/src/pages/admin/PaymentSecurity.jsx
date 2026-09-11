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
  Filter,
  Download,
  Unlock,
  Ban,
  Check,
  Search,
  User,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const PaymentSecurity = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, COMPLETED, HELD, FAILED, HIGH_RISK, DEMO, REAL
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Payment detail inspection modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleOpenDetail = async (paymentId) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      const res = await api.get(`/admin/payments/${paymentId}`);
      setSelectedPayment(res.data);
    } catch (err) {
      console.error('Failed to fetch payment detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

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

  const handleOverridePayment = async (paymentId, action) => {
    setActionLoadingId(paymentId);
    setActionMessage(null);
    try {
      const res = await api.post(`/admin/payments/${paymentId}/override`, { action });
      setActionMessage({ type: 'success', text: res.data.message });
      await fetchPaymentSecurity();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Failed to override payment:', err);
      setActionMessage({ type: 'error', text: 'Failed to update payment status.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportPayments = () => {
    if (!stats?.recent_transactions) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(stats.recent_transactions, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `payment_security_telemetry_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
        Loading UPI Payment Security Telemetry...
      </div>
    );
  }

  const transactions = (stats?.recent_transactions || []).filter((txn) => {
    if (filterTab === 'VERIFIED') return txn.status === 'COMPLETED' || txn.verification_status === 'verified';
    if (filterTab === 'PENDING') return txn.status === 'PENDING' || txn.status === 'HELD' || txn.status === 'VERIFICATION_REQUIRED';
    if (filterTab === 'FAILED') return txn.status === 'FAILED' || txn.status === 'REJECTED';
    if (filterTab === 'HIGH_RISK') return txn.risk_level === 'HIGH';
    if (filterTab === 'CRITICAL') return txn.risk_level === 'CRITICAL';
    if (filterTab === 'DEMO') return txn.is_demo === true;
    if (filterTab === 'REAL') return txn.is_demo === false;
    return true;
  }).filter((txn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (txn.user_name && txn.user_name.toLowerCase().includes(q)) ||
      (txn.upi_id && txn.upi_id.toLowerCase().includes(q)) ||
      (txn.transaction_reference && txn.transaction_reference.toLowerCase().includes(q)) ||
      (txn.provider_transaction_id && txn.provider_transaction_id.toLowerCase().includes(q)) ||
      (txn.order_id && String(txn.order_id).toLowerCase().includes(q)) ||
      String(txn.id).includes(q)
    );
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SOC Telemetry & Risk Intelligence
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            UPI Payment Security & Verification Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Real-time verification audit, server-side webhook validation, and behavioral ML fraud mitigation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportPayments}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0066ff' }}
          >
            <Download size={14} />
            <span>Export Telemetry (JSON)</span>
          </button>
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
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: actionMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
          border: actionMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3',
          color: actionMessage.type === 'success' ? '#065f46' : '#be123c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
        }}>
          {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-title">Total Payments Recorded</div>
          <div className="metric-value">{stats?.total_transactions || 0}</div>
          <div className="metric-subtitle">Total Volume: ₹{(stats?.total_volume_inr || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="metric-card success">
          <div className="metric-title" style={{ color: '#059669' }}>Verified & Completed</div>
          <div className="metric-value" style={{ color: '#059669' }}>{stats?.verified_count || 0}</div>
          <div className="metric-subtitle">Server-side auto verified</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-title" style={{ color: '#d97706' }}>Pending / Verification Required</div>
          <div className="metric-value" style={{ color: '#d97706' }}>{stats?.flagged_count || 0}</div>
          <div className="metric-subtitle">Step-up challenge or webhook pending</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-title" style={{ color: '#e11d48' }}>Blocked / Security Held</div>
          <div className="metric-value" style={{ color: '#e11d48' }}>{stats?.held_count || 0}</div>
          <div className="metric-subtitle">High anomaly hold placed</div>
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
                      User: <strong>{t.user_name || `User #${t.user_id}`}</strong> • Risk Score: {Math.round(t.anomaly_score * 100)}/100 • {new Date(t.created_at).toLocaleTimeString()}
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

      {/* Full Transaction Audit Table with Search, Filters & Detail Modal */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#0066ff" />
              <span>Real-Time Payment Records & Verification Audit</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Database-backed records showing user identities, UPI references, verification states, and risk decisions.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search user, email, payment ID, UPI ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '240px', color: '#0f172a' }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'PENDING', label: 'Pending / Held' },
            { id: 'FAILED', label: 'Failed' },
            { id: 'HIGH_RISK', label: 'High Risk' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'DEMO', label: 'Demo Payments' },
            { id: 'REAL', label: 'Real Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.7rem',
                borderRadius: '0.5rem',
                border: filterTab === tab.id ? '1.5px solid #0066ff' : '1px solid #e2e8f0',
                background: filterTab === tab.id ? '#eff6ff' : '#f8fafc',
                color: filterTab === tab.id ? '#0066ff' : '#64748b',
                fontWeight: filterTab === tab.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No payment transaction logs match the current filter or search criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>User</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Order</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Payment ID</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>UPI ID</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Amount</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Date & Time</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Status</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Verification</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Risk</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {txn.user_name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        ID #{txn.user_id}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#475569' }}>
                      {txn.order_id ? `#ORD-${txn.order_id}` : 'N/A'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0066ff', fontSize: '0.8rem' }}>
                      {txn.transaction_reference || `PAY-${txn.id}`}
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {txn.upi_id || 'N/A'}
                    </td>
                    <td style={{ fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      ₹{txn.amount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                      <div>{new Date(txn.created_at).toLocaleDateString('en-IN')}</div>
                      <div>{new Date(txn.created_at).toLocaleTimeString('en-IN')}</div>
                    </td>
                    <td>
                      <StatusBadge status={txn.status} />
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.725rem',
                        fontWeight: '700',
                        background: txn.status === 'COMPLETED' ? '#ecfdf5' : '#fef3c7',
                        color: txn.status === 'COMPLETED' ? '#065f46' : '#92400e',
                        border: txn.status === 'COMPLETED' ? '1px solid #a7f3d0' : '1px solid #fde68a'
                      }}>
                        {txn.is_demo ? 'DEMO Auto' : 'Server Auto'}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenDetail(txn.id)}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: '#f8fafc', color: '#0066ff', borderColor: '#cbd5e1' }}
                          title="Inspect Payment Details & Security Timeline"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        {txn.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleOverridePayment(txn.id, 'APPROVE')}
                            className="btn btn-sm btn-primary"
                            disabled={actionLoadingId === txn.id}
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                            title="Release Hold & Approve"
                          >
                            <Unlock size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Payment Security & Verification Inspection"
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading detailed payment telemetry...
          </div>
        ) : selectedPayment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            
            {/* Demo Payment Notice if applicable */}
            {selectedPayment.payment?.is_demo && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Info size={16} />
                <span>DEMO PAYMENT MODE: Simulated verification for academic demonstration. No real money was transferred.</span>
              </div>
            )}

            {/* Overview Details Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              
              {/* User Profile */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  User Information
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedPayment.user?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                  Email: {selectedPayment.user?.email}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Phone: {selectedPayment.user?.phone || 'N/A'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  User ID: #{selectedPayment.user?.id} • Role: {selectedPayment.user?.role}
                </div>
              </div>

              {/* Payment Details */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Payment Details
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{selectedPayment.payment?.amount?.toLocaleString('en-IN')} {selectedPayment.payment?.currency}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                  UPI ID: {selectedPayment.payment?.upi_id}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  Ref: {selectedPayment.payment?.transaction_reference}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Txn ID: {selectedPayment.payment?.provider_transaction_id}
                </div>
              </div>

              {/* Verification Assessment */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Verification Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={selectedPayment.payment?.status} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0066ff' }}>
                    ({selectedPayment.verification?.source?.toUpperCase()})
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.4rem' }}>
                  Auto Verified: {selectedPayment.verification?.is_auto_verified ? 'Yes' : 'Pending'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Mode: {selectedPayment.verification?.mode}
                </div>
              </div>

              {/* Risk Engine Assessment */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Risk & Security
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RiskBadge level={selectedPayment.security?.risk_level} score={selectedPayment.security?.risk_score} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.4rem' }}>
                  Risk Score: {Math.round(selectedPayment.security?.risk_score * 100)}/100
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Threat: {selectedPayment.security?.threat_type || 'None Detected'}
                </div>
              </div>
            </div>

            {/* Why Flagged / Security Explanation */}
            <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Security Analysis & Behavioral Signals
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {selectedPayment.security?.why_flagged || 'Clean behavioral evaluation. No suspicious velocity or endpoint transition patterns detected.'}
              </p>
            </div>

            {/* Chronological Timeline */}
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#0066ff" />
                <span>Chronological Transaction & Security Timeline</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedPayment.timeline?.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#0066ff', minWidth: '60px', paddingTop: '0.1rem' }}>
                      {step.time}
                    </div>
                    <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '0.75rem', flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                        {step.event}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {step.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOC Actions within Modal */}
            {selectedPayment.payment?.status !== 'COMPLETED' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    handleOverridePayment(selectedPayment.payment.id, 'APPROVE');
                    setIsDetailModalOpen(false);
                  }}
                  className="btn btn-primary"
                >
                  <Unlock size={14} /> Approve & Release Hold
                </button>
                <button
                  onClick={() => {
                    handleOverridePayment(selectedPayment.payment.id, 'REJECT');
                    setIsDetailModalOpen(false);
                  }}
                  className="btn btn-secondary"
                  style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fff1f2' }}
                >
                  <Ban size={14} /> Reject Payment
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default PaymentSecurity;
