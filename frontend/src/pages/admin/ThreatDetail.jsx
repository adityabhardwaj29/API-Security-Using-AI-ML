import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Activity,
  User,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';
import { XAIBarChart } from '../../components/XAIBarChart';

export const ThreatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchThreat = async () => {
    try {
      const res = await api.get(`/threats/${id}`);
      setThreat(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreat();
  }, [id]);

  const handleAction = async (action) => {
    setIsUpdating(true);
    try {
      await api.post(`/threats/${id}/action`, {
        action,
        notes: actionNotes || 'SOC action applied.',
      });
      await fetchThreat();
      setActionNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading threat telemetry...</div>;
  }

  if (!threat) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2 style={{ color: '#0f172a' }}>Threat record not found</h2>
        <Link to="/admin/threats" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Threat Stream
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/threats" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                Threat Incident #{threat.id}: {threat.threat_type}
              </h1>
              <RiskBadge level={threat.risk_level} score={threat.anomaly_score} />
              <StatusBadge status={threat.status} />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Logged at {new Date(threat.created_at).toLocaleString()} • Confidence: <strong>{Math.round(threat.confidence * 100)}%</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleAction('ACKNOWLEDGE')}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
            disabled={isUpdating || threat.status === 'ACKNOWLEDGED'}
          >
            Acknowledge Incident
          </button>
          <button
            onClick={() => handleAction('MITIGATE')}
            className="btn btn-danger btn-sm"
            disabled={isUpdating || threat.status === 'MITIGATED'}
          >
            Apply Mitigation Controls
          </button>
          <button
            onClick={() => handleAction('FALSE_POSITIVE')}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }}
            disabled={isUpdating || threat.status === 'FALSE_POSITIVE'}
          >
            Mark False Positive
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Left Column: Context & Metadata */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Target Telemetry
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Target Endpoint</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#0066ff', fontWeight: '800', marginTop: '0.15rem' }}>
                  {threat.endpoint}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Event Classification</span>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '0.15rem' }}>
                  {threat.event_type}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Targeted User / Identity</span>
                <div style={{ color: '#0f172a', fontWeight: '600', marginTop: '0.15rem' }}>
                  {threat.user ? `${threat.user.name} (${threat.user.email})` : 'Anonymous Client / Unauthenticated Probe'}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Current Action State</span>
                <div style={{ color: '#475569', marginTop: '0.15rem' }}>
                  {threat.action_taken}
                </div>
              </div>

              {threat.details && (
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Observed Anomaly Markers</span>
                  <div style={{ color: '#be123c', fontSize: '0.825rem', marginTop: '0.2rem', background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                    {threat.details}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Investigation Link */}
          {threat.user_id && (
            <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                User Behavioral Timeline
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                Reconstruct the full chronological session sequence for this user.
              </p>
              <Link to={`/admin/users/${threat.user_id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', background: '#f8fafc', borderColor: '#e2e8f0', color: '#0066ff' }}>
                <User size={14} />
                <span>Investigate User Activity Timeline</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Columns: XAI & LLM Threat Intelligence */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* LLM Structured Intelligence Box (Section 20 & 28) */}
          <div className="card" style={{ background: '#ffffff', borderColor: '#bfdbfe', position: 'relative', boxShadow: '0 4px 16px rgba(0, 102, 255, 0.06)' }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '16px',
              background: 'linear-gradient(135deg, #0066ff, #0284c7)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(0, 102, 255, 0.3)',
            }}>
              <Sparkles size={13} />
              <span>LLM THREAT SYNTHESIS ({threat.explanation?.llm_model || 'DETERMINISTIC'})</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#0066ff" />
              <span>Security Incident Synthesis</span>
            </h3>

            <div style={{ color: '#0f172a', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              {threat.explanation?.explanation || 'Statistical anomaly detected across behavioral vectors.'}
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#059669', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} />
              <span>Actionable SOC Recommendations</span>
            </h4>

            <div style={{
              color: '#065f46',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              background: '#ecfdf5',
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #a7f3d0',
            }}>
              {threat.explanation?.recommendation || '1. Enforce Multi-Factor Authentication step-up.\n2. Monitor subsequent API flow transitions.'}
            </div>
          </div>

          {/* XAI / SHAP Feature Attribution Breakdown (Section 19) */}
          <XAIBarChart
            features={threat.explanation?.important_features || []}
            method={threat.explanation?.method || 'SHAP'}
          />
        </div>
      </div>
    </div>
  );
};
