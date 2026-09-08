import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Cpu,
  Share2,
  Activity,
  Layers,
  Sparkles,
  Bot,
  Radio,
  FileCode,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_STAGES = [
  {
    id: 1,
    name: '1. API Request Interceptor',
    tag: 'INGESTION',
    icon: Activity,
    color: '#0284c7',
    description: 'Intercepts incoming HTTP/REST requests via FastAPI non-blocking ASGI middleware without adding latency overhead.',
    inputs: 'HTTP Headers, Client IP, JWT Token, Request Method, URL Path, Payload',
    outputs: 'Enriched RequestContext object stamped with unique Request ID (UUID)',
    db_table: 'None (In-Memory ASGI Context)',
    algorithm: 'Asynchronous Event Interceptor Middleware',
    sample_output: '{\n  "request_id": "REQ-8902-SEC",\n  "client_ip": "127.0.0.1",\n  "method": "POST",\n  "path": "/api/payments/verify",\n  "timestamp": "2026-09-08T09:12:00Z"\n}',
  },
  {
    id: 2,
    name: '2. Structured API Logger',
    tag: 'LOGGING',
    icon: Database,
    color: '#0ea5e9',
    description: 'Sanitizes and records structured API event telemetry into PostgreSQL. Sensitive headers, UPI PINs, and auth secrets are automatically masked.',
    inputs: 'RequestContext, Response Status Code, Latency in milliseconds',
    outputs: 'Persisted ApiLog record with event categorization (AUTH, PAYMENT, CART, ADMIN)',
    db_table: 'api_logs',
    algorithm: 'Asynchronous Batch Logging with PII Masking',
    sample_output: '{\n  "id": 1408,\n  "endpoint": "/api/payments/verify",\n  "status_code": 200,\n  "response_time_ms": 42.5,\n  "event_type": "PAYMENT",\n  "user_id": 2\n}',
  },
  {
    id: 3,
    name: '3. Feature Engineering',
    tag: 'FEATURES',
    icon: Layers,
    color: '#6366f1',
    description: 'Computes a 14-dimensional normalized numerical behavioral vector across a 60-second sliding window per client session.',
    inputs: 'Past 60-second ApiLog sequence for active User/IP',
    outputs: '14-Feature Snapshot (Velocity, Error Rate, Transition Frequencies, Sequence Deviation)',
    db_table: 'feature_snapshots',
    algorithm: 'Sliding Window Exponential Decay Aggregator',
    sample_output: '{\n  "requests_per_minute": 42.0,\n  "payment_frequency": 6,\n  "error_rate": 0.35,\n  "unique_endpoints": 3,\n  "behavior_deviation": 0.82\n}',
  },
  {
    id: 4,
    name: '4. Isolation Forest ML',
    tag: 'ANOMALY DETECTION',
    icon: Cpu,
    color: '#8b5cf6',
    description: 'Baseline unsupervised Machine Learning model that isolates anomalies by building random decision trees across 14-feature space.',
    inputs: '14-feature behavior vector from Step 3',
    outputs: 'Continuous Anomaly Score [0.0 - 1.0] and Binary Anomaly Label',
    db_table: 'None (Scikit-Learn Pre-trained Joblib Model)',
    algorithm: 'IsolationForest (n_estimators=100, contamination=0.08)',
    sample_output: '{\n  "anomaly_score": 0.814,\n  "is_anomalous": true,\n  "contamination_threshold": 0.45\n}',
  },
  {
    id: 5,
    name: '5. NetworkX API Flow Graph',
    tag: 'GRAPH ANALYTICS',
    icon: Share2,
    color: '#a855f7',
    description: 'Constructs a directed multigraph representing legitimate navigation patterns versus anomalous jumping transitions (e.g. Skip-to-Payment).',
    inputs: 'Sequential endpoint transitions (source_node -> target_node)',
    outputs: 'Directed Graph with edge weights, in/out degrees, and transition probabilities',
    db_table: 'graph_events',
    algorithm: 'NetworkX DiGraph & State-Transition Markov Matrix',
    sample_output: '{\n  "nodes": 12,\n  "edges": 28,\n  "current_path": ["/api/login", "/api/products", "/api/payments/verify"],\n  "unusual_transition": true\n}',
  },
  {
    id: 6,
    name: '6. PyTorch Geometric GNN',
    tag: 'DEEP LEARNING',
    icon: Cpu,
    color: '#ec4899',
    description: 'Graph Neural Network utilizing GraphSAGE / GCN message passing to model relational topology across multi-hop API interactions.',
    inputs: 'Graph Node Embeddings (64-dim) + Edge Indices (PyG Data)',
    outputs: 'Graph Structural Anomaly Probability & Node Embeddings',
    db_table: 'None (PyTorch Saved Weights .pt)',
    algorithm: 'PyTorch Geometric GraphSAGE (2-Layer SageConv + ReLU)',
    sample_output: '{\n  "gnn_status": "TRAINED",\n  "graph_risk_probability": 0.873,\n  "structural_anomaly": true\n}',
  },
  {
    id: 7,
    name: '7. Multi-Signal Risk Engine',
    tag: 'DECISION ENGINE',
    icon: ShieldAlert,
    color: '#f43f5e',
    description: 'Ensemble risk fusion unit that combines Isolation Forest, GNN graph signals, and endpoint criticality heuristics into a calibrated 0-100 score.',
    inputs: 'ML Anomaly Score (40%), GNN Score (35%), Endpoint Sensitivity (25%)',
    outputs: 'Final Risk Score (0-100) and Level (LOW, MEDIUM, HIGH, CRITICAL)',
    db_table: 'threats',
    algorithm: 'Calibrated Dynamic Weighted Ensemble Scoring',
    sample_output: '{\n  "risk_score": 82,\n  "risk_level": "HIGH",\n  "triggers": ["HIGH_VELOCITY", "PAYMENT_BURST"]\n}',
  },
  {
    id: 8,
    name: '8. SHAP XAI Explainer',
    tag: 'EXPLAINABILITY',
    icon: Sparkles,
    color: '#f59e0b',
    description: 'Computes exact Shapley values to pinpoint the mathematical contribution of each behavioral feature towards the anomaly decision.',
    inputs: '14-feature behavior vector + Model Background Dataset',
    outputs: 'Ranked Feature Attribution List (% contribution)',
    db_table: 'threat_explanations',
    algorithm: 'SHAP TreeExplainer / Empirical Signal Attribution Fallback',
    sample_output: '[\n  {"feature": "payment_frequency", "importance": 0.38, "value": 6},\n  {"feature": "requests_per_minute", "importance": 0.29, "value": 42.0},\n  {"feature": "behavior_deviation", "importance": 0.21, "value": 0.82}\n]',
  },
  {
    id: 9,
    name: '9. LLM Human Synthesizer',
    tag: 'NATURAL LANGUAGE',
    icon: Bot,
    color: '#10b981',
    description: 'Synthesizes structured numerical evidence into clear, actionable executive incident summaries for SOC analysts without hallucination.',
    inputs: 'Structured Evidence JSON (Endpoint, Risk, SHAP Top Features)',
    outputs: 'Human-readable explanation, root cause analysis, and remediation guidance',
    db_table: 'threat_explanations',
    algorithm: 'OpenAI GPT-4o-mini or Deterministic Rule Synthesizer Fallback',
    sample_output: '{\n  "explanation": "Client executed 6 rapid payment verifications in 60s, triggering multi-signal risk alert.",\n  "recommendation": "Require Step-Up MFA Challenge token and rate-limit client IP."\n}',
  },
  {
    id: 10,
    name: '10. Real-Time SOC Broadcast',
    tag: 'OBSERVABILITY',
    icon: Radio,
    color: '#06b6d4',
    description: 'Broadcasts instant security event alerts to connected SOC consoles via WebSockets and enforces automated mitigation policies.',
    inputs: 'Complete Security Threat & Explanation Object',
    outputs: 'Instantaneous Live Dashboard Notification & MFA Challenge Enforcement',
    db_table: 'security_events',
    algorithm: 'FastAPI WebSocket ConnectionManager Broadcast',
    sample_output: '{\n  "event": "NEW_SECURITY_THREAT",\n  "threat_id": 142,\n  "risk_level": "HIGH",\n  "action": "CHALLENGE_VERIFICATION"\n}',
  },
];

export function SecurityPipeline() {
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [selectedStage, setSelectedStage] = useState(DEFAULT_STAGES[0]);

  useEffect(() => {
    // Optionally fetch live pipeline metadata
    api.get('/admin/pipeline-info')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Merge metadata
          const merged = DEFAULT_STAGES.map((s, idx) => ({
            ...s,
            ...(res.data[idx] || {}),
          }));
          setStages(merged);
          setSelectedStage(merged[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Layers size={14} /> End-to-End Pipeline Architecture
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Interactive AI/ML Detection Pipeline
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '850px', marginTop: '0.5rem' }}>
          Click any of the 10 sequential processing stages below to inspect inputs, outputs, mathematical algorithms, database tables, and real JSON telemetry payloads.
        </p>
      </div>

      {/* 10-Stage Horizontal Stepper / Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {stages.map((st) => {
          const isSelected = selectedStage.id === st.id;
          const IconComp = st.icon || Activity;
          return (
            <div
              key={st.id}
              onClick={() => setSelectedStage(st)}
              style={{
                background: isSelected ? '#0f172a' : '#ffffff',
                color: isSelected ? '#ffffff' : '#0f172a',
                borderRadius: '0.75rem',
                border: isSelected ? '2px solid #38bdf8' : '1px solid #e2e8f0',
                padding: '1.25rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 10px 15px -3px rgba(15, 23, 42, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.375rem',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#f1f5f9',
                      color: isSelected ? '#38bdf8' : '#0284c7',
                    }}
                  >
                    {st.tag}
                  </span>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? '#1e293b' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#38bdf8' : st.color,
                    }}
                  >
                    <IconComp size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.25rem' }}>
                  {st.name}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: isSelected ? '#94a3b8' : '#64748b' }}>
                Inspect Stage <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Deep-Dive Card */}
      {selectedStage && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Header of Card */}
          <div
            style={{
              padding: '1.5rem 2rem',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
                STAGE {selectedStage.id} OF 10 • {selectedStage.tag}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {selectedStage.name}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ background: '#1e293b', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Database: <strong style={{ color: '#38bdf8' }}>{selectedStage.db_table}</strong>
              </div>
            </div>
          </div>

          {/* Body Content: Grid */}
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Left: Explanations */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Functional Purpose
                </h3>
                <p style={{ fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>
                  {selectedStage.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Inputs Ingested
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                    {selectedStage.inputs}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Outputs Produced
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                    {selectedStage.outputs}
                  </div>
                </div>
              </div>

              <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Algorithm / Technique
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0c4a6e', fontWeight: 700 }}>
                  {selectedStage.algorithm}
                </div>
              </div>
            </div>

            {/* Right: Telemetry JSON Payload */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileCode size={14} /> Telemetry Payload Sample
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>JSON Format</span>
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  overflowX: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {selectedStage.sample_output}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityPipeline;
