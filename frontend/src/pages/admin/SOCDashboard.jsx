import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Users,
  CreditCard,
  Cpu,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  Radio,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { useRealtime } from '../../hooks/useRealtime';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const SOCDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastMessage, latestThreat } = useRealtime();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Live auto-refresh stats when new threat or event arrives over WebSocket
  useEffect(() => {
    if (lastMessage) {
      fetchStats();
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
        Connecting to Security Operations Center & Telemetry Stream...
      </div>
    );
  }

  const riskPieData = stats?.risk_distribution
    ? [
        { name: 'LOW', value: stats.risk_distribution.LOW || 0, color: '#10b981' },
        { name: 'MEDIUM', value: stats.risk_distribution.MEDIUM || 0, color: '#f59e0b' },
        { name: 'HIGH', value: stats.risk_distribution.HIGH || 0, color: '#f43f5e' },
        { name: 'CRITICAL', value: stats.risk_distribution.CRITICAL || 0, color: '#be123c' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      {/* Top Banner / Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Live Security Monitor
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Security Operations Center (SOC)
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Real-time API threat intelligence, Isolation Forest baseline & PyTorch GNN structural anomaly detection
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchStats}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0' }}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>
          <Link to="/admin/simulator" className="btn btn-primary btn-sm">
            <Zap size={14} />
            <span>Launch Traffic Simulator</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - All Database-Backed Real KPIs */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-title">Total Users</div>
          <div className="metric-value" style={{ color: '#0066ff' }}>{stats?.total_users || 0}</div>
          <div className="metric-subtitle">
            <span style={{ color: '#059669', fontWeight: '700' }}>+{stats?.new_users_today || 0} registered today</span>
          </div>
        </div>

        <div className="metric-card cyan">
          <div className="metric-title">Total API Requests</div>
          <div className="metric-value">{stats?.total_api_requests || 0}</div>
          <div className="metric-subtitle">Audit telemetry logs captured</div>
        </div>

        <div className="metric-card success">
          <div className="metric-title" style={{ color: '#059669' }}>Successful Payments</div>
          <div className="metric-value" style={{ color: '#059669' }}>{stats?.successful_payments || 0}</div>
          <div className="metric-subtitle">Verified & completed</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-title" style={{ color: '#d97706' }}>Pending / Held Payments</div>
          <div className="metric-value" style={{ color: '#d97706' }}>{stats?.pending_payments || 0}</div>
          <div className="metric-subtitle">Awaiting verification challenge</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="metric-card danger">
          <div className="metric-title" style={{ color: '#e11d48' }}>Failed Payments</div>
          <div className="metric-value" style={{ color: '#e11d48' }}>{stats?.failed_payments || 0}</div>
          <div className="metric-subtitle">Rejected or failed verification</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-title" style={{ color: '#d97706' }}>Payment Security Alerts</div>
          <div className="metric-value" style={{ color: '#d97706' }}>{stats?.payment_security_alerts || 0}</div>
          <div className="metric-subtitle">Threats on payment endpoints</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-title" style={{ color: '#be123c' }}>High / Critical Risk Events</div>
          <div className="metric-value" style={{ color: '#be123c' }}>
            {(stats?.high_risk_events || 0) + (stats?.critical_events || 0)}
          </div>
          <div className="metric-subtitle">Critical anomaly threshold hits</div>
        </div>

        <div className="metric-card success">
          <div className="metric-title" style={{ color: '#059669' }}>PyTorch GNN Core</div>
          <div className="metric-value" style={{ fontSize: '1.25rem', color: stats?.gnn_status === 'TRAINED' ? '#059669' : '#0066ff' }}>
            {stats?.gnn_status === 'TRAINED' ? '● MODEL ACTIVE' : '○ GNN NOT TRAINED'}
          </div>
          <div className="metric-subtitle">API Flow Graph structural classifier</div>
        </div>
      </div>

      {/* Live Security Monitor Banner (Section 27) */}
      {stats?.recent_threats && stats.recent_threats.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #fecdd3',
          borderLeft: '4px solid #e11d48',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 16px rgba(225, 29, 72, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ffe4e6',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(225, 29, 72, 0.2)',
            }}>
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-critical">🔴 {stats.recent_threats[0].risk_level} RISK THREAT</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                  {stats.recent_threats[0].user?.name || (stats.recent_threats[0].user_id ? `User #${stats.recent_threats[0].user_id}` : 'Anonymous User')}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Target: <strong style={{ color: '#0066ff' }}>{stats.recent_threats[0].endpoint}</strong>
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {stats.recent_threats[0].threat_type} • Anomaly Score: <strong>{(stats.recent_threats[0].anomaly_score * 100).toFixed(1)}%</strong> • {new Date(stats.recent_threats[0].created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <Link
            to={`/admin/threats/${stats.recent_threats[0].id}`}
            className="btn btn-sm"
            style={{ background: '#e11d48', color: '#ffffff', fontWeight: '700', boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)' }}
          >
            <Eye size={14} />
            <span>VIEW THREAT DETAILS</span>
          </Link>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid-3" style={{ marginBottom: '1.75rem', alignItems: 'stretch' }}>
        {/* Traffic Velocity Area Chart */}
        <div className="card" style={{ gridColumn: 'span 2', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              API Traffic Volume & Error Velocity
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>Live Stream Window</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.traffic_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#0066ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReq)" name="API Requests" />
                <Area type="monotone" dataKey="errors" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorErr)" name="4xx/5xx Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
            System Risk Distribution
          </h3>

          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', fontWeight: '700' }}>
            <span style={{ color: '#10b981' }}>● Low ({stats?.risk_distribution?.LOW || 0})</span>
            <span style={{ color: '#f59e0b' }}>● Med ({stats?.risk_distribution?.MEDIUM || 0})</span>
            <span style={{ color: '#e11d48' }}>● High/Crit ({ (stats?.risk_distribution?.HIGH || 0) + (stats?.risk_distribution?.CRITICAL || 0) })</span>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Threats & Top Endpoints */}
      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Recent Threats Table */}
        <div className="card" style={{ gridColumn: 'span 2', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#e11d48" />
              <span>Real-Time Security Threat Stream</span>
            </h3>
            <Link to="/admin/threats" style={{ fontSize: '0.85rem', color: '#0066ff', fontWeight: '700' }}>
              Full Threat Monitor →
            </Link>
          </div>

          {(!stats?.recent_threats || stats.recent_threats.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No active security threats detected. System operating normally.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table" style={{ background: '#ffffff' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>User Identity</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Endpoint</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Threat Classification</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Risk Level</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Status</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Time</th>
                    <th style={{ background: '#f8fafc', color: '#475569' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_threats.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                        {t.user?.name || (t.user_id ? `User #${t.user_id}` : 'Anonymous User')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#0066ff', fontWeight: '700' }}>
                        {t.endpoint}
                      </td>
                      <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                        {t.threat_type}
                      </td>
                      <td>
                        <RiskBadge level={t.risk_level} score={t.anomaly_score} />
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {new Date(t.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <Link
                          to={`/admin/threats/${t.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#0066ff' }}
                        >
                          Investigate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* High Activity Endpoints */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#0066ff" />
            <span>Monitored Endpoints</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(stats?.top_anomalous_endpoints || []).map((ep, idx) => (
              <div key={idx} style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <code style={{ fontSize: '0.8rem', color: '#0066ff', fontWeight: '700' }}>{ep.endpoint}</code>
                  <RiskBadge level={ep.error_rate > 0.3 ? 'HIGH' : ep.error_rate > 0.1 ? 'MEDIUM' : 'LOW'} score={ep.error_rate} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Calls: <strong style={{ color: '#0f172a' }}>{ep.total_calls}</strong></span>
                  <span>Latency: <strong style={{ color: '#0f172a' }}>{ep.avg_latency_ms}ms</strong></span>
                  <span>Errors: <strong style={{ color: ep.error_count > 0 ? '#e11d48' : '#059669' }}>{ep.error_count}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent User Registrations Section (Sections 4 & 52) */}
      <div className="card" style={{ marginTop: '1.75rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#0066ff" />
              <span>Recent User Registrations</span>
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Real-time database user creation telemetry linked to SOC monitoring
            </p>
          </div>
          <Link to="/admin/users" style={{ fontSize: '0.85rem', color: '#0066ff', fontWeight: '700' }}>
            All Users ({stats?.total_users || 0}) →
          </Link>
        </div>

        {(!stats?.recent_registrations || stats.recent_registrations.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No recent user registrations recorded in the database.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>User Name</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Email</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Phone</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Registration Date & Time</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Role</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Status</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_registrations.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {u.name}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {u.email}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {u.phone || 'N/A'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(u.created_at).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className="badge" style={{ background: u.role === 'ADMIN' ? '#eff6ff' : '#f1f5f9', color: u.role === 'ADMIN' ? '#0066ff' : '#475569', fontWeight: '700' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: u.status === 'Active' ? '#ecfdf5' : '#fff1f2', color: u.status === 'Active' ? '#059669' : '#e11d48', fontWeight: '700' }}>
                        ● {u.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#0066ff' }}
                      >
                        Profile
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
