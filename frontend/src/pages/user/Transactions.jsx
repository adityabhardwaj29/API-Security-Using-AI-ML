import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowLeft, Shield } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const Transactions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/history');
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">UPI Transaction Ledger</h1>
          <p className="page-subtitle">Complete ledger of your UPI transactions, payment statuses, and AI security assessments</p>
        </div>

        <Link to="/products" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Catalog</span>
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <p>No transactions found on this account.</p>
            <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Security Risk</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#38bdf8' }}>
                      {p.transaction_reference || `UPI-HELD-${p.id}`}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.825rem' }}>
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: '800', color: '#ffffff' }}>
                      ₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                        {p.payment_method} ({p.upi_id || 'UPI'})
                      </span>
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
    </div>
  );
};
