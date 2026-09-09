import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, AlertTriangle, Shield, Download, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge } from '../../components/Badge';

export const APIMonitor = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, SENSITIVE, HIGH_ERROR, SLOW
  const [sortBy, setSortBy] = useState('requests'); // requests, errors, avg_latency, risk_score
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

  const handleExportTelemetry = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(telemetry, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `api_telemetry_metrics_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = telemetry.filter((t) => {
    const matchesSearch = t.endpoint.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'HIGH_ERROR') return t.errors > 0 || (t.error_rate || 0) > 0.1;
    if (filterType === 'SLOW') return (t.avg_latency || 0) > 100;
    if (filterType === 'HIGH_RISK') return (t.risk_score || 0) > 0.4;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'errors') return (b.errors || 0) - (a.errors || 0);
    if (sortBy === 'avg_latency') return (b.avg_latency || 0) - (a.avg_latency || 0);
    if (sortBy === 'risk_score') return (b.risk_score || 0) - (a.risk_score || 0);
    return (b.requests || 0) - (a.requests || 0);
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Endpoint Telemetry & Performance
          </span>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            API Endpoint Telemetry & Latency Monitoring
          </h1>
          <p className="page-subtitle" style={{ color: '#64748b' }}>
            Real-time endpoint request volume, error rates, unique users, and calibrated risk profiles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportTelemetry}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0066ff' }}
          >
            <Download size={14} />
            <span>Export Telemetry (JSON)</span>
          </button>
          <button
            onClick={fetchTelemetry}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
              placeholder="Filter endpoint paths (e.g. /payments, /auth)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Filter:</span>
            {[
              { id: 'ALL', label: 'All Endpoints' },
              { id: 'HIGH_ERROR', label: 'Errors > 0' },
              { id: 'SLOW', label: 'Latency > 100ms' },
              { id: 'HIGH_RISK', label: 'Elevated Risk' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '0.5rem',
                  border: filterType === f.id ? '1.5px solid #0066ff' : '1px solid #e2e8f0',
                  background: filterType === f.id ? '#eff6ff' : '#f8fafc',
                  color: filterType === f.id ? '#0066ff' : '#64748b',
                  fontWeight: filterType === f.id ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}

            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginLeft: '0.5rem' }}>Sort By:</span>
            <select
              className="form-select"
              style={{ width: '150px', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="requests">Volume (High → Low)</option>
              <option value="errors">Errors (High → Low)</option>
              <option value="avg_latency">Latency (Slowest First)</option>
              <option value="risk_score">Risk Score (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Gathering API telemetry...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No API activity matches current filter.</div>
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

export default APIMonitor;
