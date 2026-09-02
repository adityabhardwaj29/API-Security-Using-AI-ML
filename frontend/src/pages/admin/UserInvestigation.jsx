import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Search, Activity, Shield, Clock, AlertTriangle, ArrowRight, CreditCard, Lock } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export const UserInvestigation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [investigationData, setInvestigationData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
      if (userId) {
        loadUserInvestigation(userId);
      } else if (res.data.length > 0) {
        loadUserInvestigation(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInvestigation = async (id) => {
    setLoadingTimeline(true);
    try {
      const res = await api.get(`/admin/users/${id}/investigate`);
      setInvestigationData(res.data);
      setSelectedUser(res.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Forensics & Identity
        </span>
        <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
          User Behavioral Investigation
        </h1>
        <p className="page-subtitle" style={{ color: '#64748b' }}>
          Trace complete chronological session sequences, transitions, and anomalous activities
        </p>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Left Column: User Directory */}
        <div className="card" style={{ padding: '1rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
              placeholder="Search user identities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    navigate(`/admin/users/${u.id}`);
                    loadUserInvestigation(u.id);
                  }}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '1.5px solid #0066ff' : '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '800', color: isSelected ? '#0066ff' : '#0f172a', fontSize: '0.9rem' }}>
                      {u.name}
                    </span>
                    <RiskBadge level={u.risk_level} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {u.email}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: '600' }}>
                    <span>Reqs: <strong style={{ color: '#0f172a' }}>{u.request_count}</strong></span>
                    <span>Threats: <strong style={{ color: u.threat_count > 0 ? '#e11d48' : '#059669' }}>{u.threat_count}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Behavioral Investigation & Timeline */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loadingTimeline ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#ffffff', borderColor: '#e2e8f0' }}>
              Reconstructing chronological telemetry...
            </div>
          ) : investigationData ? (
            <>
              {/* User Overview Stats */}
              <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#eff6ff',
                      color: '#0066ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.2rem',
                      border: '1px solid #bfdbfe',
                    }}>
                      {investigationData.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                        {investigationData.user.name}
                      </h3>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                        {investigationData.user.email} • Role: <strong>{investigationData.user.role}</strong>
                      </div>
                    </div>
                  </div>

                  <RiskBadge level={investigationData.risk_level} score={investigationData.average_risk_score} />
                </div>

                <div className="grid-3" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Total Requests</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{investigationData.total_requests}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Payments Attempted</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{investigationData.total_payments}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Threat Alerts</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: investigationData.total_threats > 0 ? '#e11d48' : '#059669' }}>
                      {investigationData.total_threats}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chronological Behavioral Timeline */}
              <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#0066ff" />
                  <span>Session Activity & Transition Timeline</span>
                </h3>

                {investigationData.timeline.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No activity logged.</div>
                ) : (
                  <div className="timeline-list">
                    {investigationData.timeline.map((item, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className={`timeline-marker ${item.is_error ? 'danger' : 'success'}`} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{
                            fontWeight: '700',
                            color: item.is_error ? '#e11d48' : '#0f172a',
                            fontFamily: item.type === 'API_LOG' ? 'var(--font-mono)' : 'inherit',
                            fontSize: '0.85rem',
                          }}>
                            {item.action}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Status: <strong style={{ color: item.status >= 400 ? '#e11d48' : '#059669' }}>{item.status}</strong>
                          {item.latency > 0 && ` • Latency: ${item.latency}ms`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#ffffff', borderColor: '#e2e8f0' }}>
              Select a user identity on the left to start behavioral investigation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
