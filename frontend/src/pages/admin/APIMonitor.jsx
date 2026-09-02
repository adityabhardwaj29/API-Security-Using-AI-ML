import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge } from '../../components/Badge';

export const APIMonitor = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const res = await api.get('/admin/telemetry');
      setTelemetry(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const filtered = telemetry.filter((t) =>
    t.endpoint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Endpoint Telemetry
          </span>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            API Endpoint Telemetry & Latency Monitoring
          </h1>
          <p className="page-subtitle" style={{ color: '#64748b' }}>
            Real-time endpoint request volume, error rates, unique users, and risk profiles
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchTelemetry} className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ position: 'relative', maxWidth: '350px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
            placeholder="Filter endpoint paths..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Gathering API telemetry...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No API activity recorded yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>API Endpoint</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Request Volume</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Error Count</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Error Rate</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Average Latency</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Unique Clients</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ep, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0066ff' }}>
                      {ep.endpoint}
                    </td>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      {ep.requests}
                    </td>
                    <td style={{ color: ep.errors > 0 ? '#e11d48' : '#059669', fontWeight: '700' }}>
                      {ep.errors}
                    </td>
                    <td style={{ color: '#475569', fontWeight: '600' }}>
                      {((ep.error_rate || 0) * 100).toFixed(1)}%
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: ep.avg_latency > 120 ? '#d97706' : '#0f172a' }}>
                        {ep.avg_latency} ms
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontWeight: '600' }}>{ep.unique_users}</td>
                    <td>
                      <RiskBadge level={ep.risk_score > 0.5 ? 'HIGH' : ep.risk_score > 0.3 ? 'MEDIUM' : 'LOW'} score={ep.risk_score} />
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
