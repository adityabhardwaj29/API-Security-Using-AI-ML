import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Filter, RefreshCw, ExternalLink, Check, AlertOctagon } from 'lucide-react';
import api from '../../services/api';
import { useRealtime } from '../../hooks/useRealtime';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const ThreatMonitor = () => {
  const [threats, setThreats] = useState([]);
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const { lastMessage } = useRealtime();

  const fetchThreats = async () => {
    try {
      const params = {};
      if (riskFilter) params.risk_level = riskFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/threats', { params });
      setThreats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [riskFilter, statusFilter]);

  // Re-fetch on incoming WebSocket message
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'THREAT_ALERT') {
      fetchThreats();
    }
  }, [lastMessage]);

  const handleQuickAction = async (threatId, action) => {
    try {
      await api.post(`/threats/${threatId}/action`, { action, notes: 'Quick SOC mitigation control applied.' });
      fetchThreats();
    } catch (err) {
      console.error('Failed to update threat action:', err);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Real-Time Feed
          </span>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Live Security Threat Monitor
          </h1>
          <p className="page-subtitle" style={{ color: '#64748b' }}>
            Zero-latency incident stream with XAI attribution & automated LLM threat synthesis
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchThreats} className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700' }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select
            className="form-select"
            style={{ width: '170px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="">All Severity</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>

          <select
            className="form-select"
            style={{ width: '170px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Threats</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>

          {(riskFilter || statusFilter) && (
            <button
              onClick={() => { setRiskFilter(''); setStatusFilter(''); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Threats Table */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Streaming threat incidents...</div>
        ) : threats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: '700', color: '#0f172a' }}>No Threats Found</div>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>No active security events matching current criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Timestamp</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Target Endpoint</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Threat Classification</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Risk Score</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Severity</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Status</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Quick Action</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Deep Dive</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.created_at).toLocaleTimeString()}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#0066ff', fontWeight: '700' }}>
                      {t.endpoint}
                    </td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {t.threat_type}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#0f172a' }}>
                      {Math.round(t.anomaly_score * 100)}%
                    </td>
                    <td>
                      <RiskBadge level={t.risk_level} score={t.anomaly_score} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      {t.status === 'ACTIVE' ? (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleQuickAction(t.id, 'ACKNOWLEDGE')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                            title="Acknowledge Threat"
                          >
                            Ack
                          </button>
                          <button
                            onClick={() => handleQuickAction(t.id, 'MITIGATE')}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            title="Apply Rate Limit & Mitigation"
                          >
                            Mitigate
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Resolved</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/threats/${t.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#f8fafc', borderColor: '#e2e8f0', color: '#0066ff' }}>
                        <span>Inspect</span>
                        <ExternalLink size={12} />
                      </Link>
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
