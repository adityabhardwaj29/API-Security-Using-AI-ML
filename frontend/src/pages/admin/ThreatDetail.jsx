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
  Layers,
  HelpCircle,
  Share2,
  Database,
  Bot,
  FileCode,
  X,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/Badge';
import { XAIBarChart } from '../../components/XAIBarChart';

export const ThreatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threat, setThreat] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWhyFlagged, setShowWhyFlagged] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState('summary');

  const fetchThreat = async () => {
    try {
      const [tRes, invRes] = await Promise.all([
        api.get(`/threats/${id}`),
        api.get(`/admin/investigation/${id}`).catch(() => ({ data: null })),
      ]);
      setThreat(tRes.data);
      setInvestigation(invRes.data);
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
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading threat telemetry & investigation...</div>;
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

  const steps = investigation?.pipeline_steps || {};
  const whyReasons = investigation?.why_flagged || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/threats" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem', background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                Incident #{threat.id}: {threat.threat_type}
              </h1>
              <RiskBadge level={threat.risk_level} score={threat.anomaly_score} />
              <StatusBadge status={threat.status} />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Logged at {new Date(threat.created_at).toLocaleString()} • Confidence: <strong>{Math.round(threat.confidence * 100)}%</strong>
            </p>
          </div>
        </div>

        {/* Action Controls & "Why was this flagged?" Button */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowWhyFlagged(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={16} /> Why was this flagged?
          </button>
          <button
            onClick={() => handleAction('ACKNOWLEDGE')}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
            disabled={isUpdating}
          >
            Acknowledge
          </button>
          <button
            onClick={() => handleAction('CHALLENGE_MFA')}
            className="btn btn-warning btn-sm"
            disabled={isUpdating}
          >
            Challenge Step-Up MFA
          </button>
          <button
            onClick={() => handleAction('RESOLVE')}
            className="btn btn-primary btn-sm"
            disabled={isUpdating}
          >
            Resolve Threat
          </button>
        </div>
      </div>

      {/* "Why was this flagged?" Drawer / Modal */}
      {showWhyFlagged && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle style={{ color: '#0284c7' }} size={22} /> Why Was This Flagged?
              </h3>
              <button
                onClick={() => setShowWhyFlagged(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Our multi-signal AI/ML engine identified the following concrete anomalies during this request:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {whyReasons.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      Reason {idx + 1}: {r.reason}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                        background: r.severity === 'CRITICAL' ? '#fee2e2' : r.severity === 'HIGH' ? '#ffedd5' : '#e0f2fe',
                        color: r.severity === 'CRITICAL' ? '#991b1b' : r.severity === 'HIGH' ? '#c2410c' : '#0369a1',
                      }}
                    >
                      {r.severity}
                    </span>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                    {r.detail}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowWhyFlagged(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Close Investigation Reasons
            </button>
          </div>
        </div>
      )}

      {/* 10-Step Investigation Story Tabs */}
      <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} style={{ color: '#0284c7' }} /> 10-Step Evidence Investigation Pipeline
        </h2>

        {/* Horizontal Navigation of Steps */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'summary', label: 'Executive Summary' },
            { id: 'step1', label: '1. API Request' },
            { id: 'step2', label: '2. Structured Log' },
            { id: 'step3', label: '3. Features' },
            { id: 'step4', label: '4. Isolation Forest' },
            { id: 'step5', label: '5. Graph Traversal' },
            { id: 'step6', label: '6. PyG GNN' },
            { id: 'step7', label: '7. Risk Fusion' },
            { id: 'step8', label: '8. SHAP XAI' },
            { id: 'step9', label: '9. LLM Synthesizer' },
            { id: 'step10', label: '10. Decision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStepTab(tab.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: activeStepTab === tab.id ? '#0f172a' : '#f8fafc',
                color: activeStepTab === tab.id ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeStepTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Target User & Endpoint</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{threat.user?.name || 'Anonymous Client'}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{threat.user?.email || 'N/A'} • Role: {threat.user?.role || 'GUEST'}</div>
              <div style={{ marginTop: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#0284c7', background: '#e0f2fe', padding: '0.35rem 0.6rem', borderRadius: '0.375rem', display: 'inline-block' }}>
                {threat.endpoint}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI/ML Security Verdict</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: threat.risk_level === 'CRITICAL' ? '#dc2626' : '#ea580c' }}>
                  Risk Score: {Math.round(threat.anomaly_score * 100)} / 100
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Action Enforced: <strong>{threat.action_taken || 'CHALLENGE_VERIFICATION'}</strong>
              </div>
            </div>
          </div>
        )}

        {activeStepTab === 'step1' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>1. API Request Interception</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Incoming HTTP request captured by FastAPI non-blocking middleware.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step1_request || { endpoint: threat.endpoint, method: 'POST', ip: '127.0.0.1' }, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step2' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>2. Structured API Log Telemetry</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Persisted record in PostgreSQL <code>api_logs</code> table with sanitized headers.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step2_logging || { db_table: 'api_logs', status_code: 200, response_time_ms: 42 }, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step3' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>3. 14-Feature Behavioral Snapshot</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Sliding-window normalized behavior features aggregated in memory and stored in <code>feature_snapshots</code>.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step3_features?.features || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step4' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>4. Isolation Forest ML Scoring</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Continuous anomaly score computed via 100 isolation decision trees.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step4_ml || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step5' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>5. NetworkX API Flow Traversal</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Directed graph transition analysis tracking navigation pathways.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step5_graph || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step6' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>6. PyTorch Geometric GNN Inference</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>GraphSAGE relational topology convolutions detecting multi-hop graph anomalies.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step6_gnn || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step7' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>7. Multi-Signal Risk Fusion Engine</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Weighted combination of tabular ML, GNN embeddings, and critical endpoint weights.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step7_risk_engine || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeStepTab === 'step8' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>8. SHAP Explainability & Feature Attribution</h3>
            <div style={{ marginTop: '1rem' }}>
              <XAIBarChart features={threat.explanation?.important_features || steps.step8_xai?.important_features || []} />
            </div>
          </div>
        )}

        {activeStepTab === 'step9' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bot size={18} style={{ color: '#059669' }} /> 9. LLM Human Synthesizer
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Model: <strong>{threat.explanation?.llm_model || 'gpt-4o-mini (or Rule Synthesizer Fallback)'}</strong>
            </p>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {threat.explanation?.explanation || 'Multivariate anomaly detected by combined ML and GNN pipeline.'}
            </div>
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
              💡 Recommendation: {threat.explanation?.recommendation || 'Enforce Step-up MFA verification.'}
            </div>
          </div>
        )}

        {activeStepTab === 'step10' && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>10. Security Decision & Real-Time Alert</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Instant WebSocket dispatch to all connected SOC consoles.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {JSON.stringify(steps.step10_decision || { final_decision: threat.action_taken, status: threat.status, websocket_broadcast: true }, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Manual SOC Action Note */}
      <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Analyst Incident Notes
        </h3>
        <textarea
          rows={2}
          placeholder="Add internal SOC notes before updating threat status..."
          value={actionNotes}
          onChange={(e) => setActionNotes(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '0.75rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleAction('RESOLVE')}
            disabled={isUpdating}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Save Note & Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetail;
