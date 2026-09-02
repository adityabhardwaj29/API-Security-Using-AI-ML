import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sliders, Cpu, Key, Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const AdminSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading SOC settings...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Platform Configuration
        </span>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
          Security & Core Settings
        </h1>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* Risk Thresholds Card */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="#0066ff" />
            <span>Risk Engine Calibrated Thresholds</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>MEDIUM Risk Cutoff</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Triggers passive session monitoring</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#d97706', fontSize: '1.1rem' }}>
                {config?.thresholds?.medium || 0.40}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>HIGH Risk Cutoff</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Enforces step-up identity challenge & admin alert</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#f43f5e', fontSize: '1.1rem' }}>
                {config?.thresholds?.high || 0.70}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>CRITICAL Risk Cutoff</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Immediately places security hold & SOC broadcast</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#be123c', fontSize: '1.1rem' }}>
                {config?.thresholds?.critical || 0.88}
              </span>
            </div>
          </div>
        </div>

        {/* UPI & Payment Configuration */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#10b981" />
            <span>UPI Payment & Market Environment</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Currency & Symbol</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Indian Rupee standards</div>
              </div>
              <span style={{ fontWeight: '800', color: '#0066ff', fontSize: '1rem' }}>
                {config?.currency} ({config?.currency_symbol})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Merchant UPI ID</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Target VPA for QR payload generation</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                {config?.upi_id}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Execution Mode</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Demonstration & Sandbox state</div>
              </div>
              <span className="badge badge-low" style={{ textTransform: 'uppercase' }}>
                {config?.payment_mode} MODE
              </span>
            </div>
          </div>
        </div>

        {/* Machine Learning & GNN Status */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="#8b5cf6" />
            <span>AI / ML & GNN Detectors</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Baseline ML Detector</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Scikit-Learn Isolation Forest</div>
              </div>
              <span className="badge badge-low">
                {config?.ml?.is_fitted ? 'ACTIVE & FITTED' : 'INITIALIZING'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>PyTorch GNN Core</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>GraphSAGE / GCN structural encoder</div>
              </div>
              <span className="badge" style={{ background: config?.gnn?.status === 'TRAINED' ? '#ecfdf5' : '#eff6ff', color: config?.gnn?.status === 'TRAINED' ? '#059669' : '#0284c7', border: '1px solid #cbd5e1' }}>
                {config?.gnn?.status}
              </span>
            </div>
          </div>
        </div>

        {/* LLM Synthesis Configuration */}
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#0284c7" />
            <span>LLM Threat Synthesis Provider</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Active Model</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>OpenAI compatible endpoint</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                {config?.llm?.model}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Synthesis Engine</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Rule engine or external LLM API</div>
              </div>
              <span className="badge badge-low">
                {config?.llm?.is_configured ? 'LLM API CONNECTED' : 'DETERMINISTIC FALLBACK'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
