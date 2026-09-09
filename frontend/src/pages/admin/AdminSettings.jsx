import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sliders, Cpu, Key, Save, RotateCcw, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const AdminSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable form fields
  const [mediumThreshold, setMediumThreshold] = useState(0.40);
  const [highThreshold, setHighThreshold] = useState(0.70);
  const [criticalThreshold, setCriticalThreshold] = useState(0.88);
  const [upiId, setUpiId] = useState('aadityabhardwaj5398@oksbi');
  const [paymentMode, setPaymentMode] = useState('demo');
  const [contamination, setContamination] = useState(0.08);
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setConfig(res.data);
      if (res.data.thresholds) {
        setMediumThreshold(res.data.thresholds.medium || 0.40);
        setHighThreshold(res.data.thresholds.high || 0.70);
        setCriticalThreshold(res.data.thresholds.critical || 0.88);
      }
      if (res.data.upi_id) setUpiId(res.data.upi_id);
      if (res.data.payment_mode) setPaymentMode(res.data.payment_mode);
      if (res.data.ml?.contamination) setContamination(res.data.ml.contamination);
      if (res.data.llm?.model) setLlmModel(res.data.llm.model);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setErrorMessage('Failed to load current SOC platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      const res = await api.put('/admin/settings', {
        medium_threshold: parseFloat(mediumThreshold),
        high_threshold: parseFloat(highThreshold),
        critical_threshold: parseFloat(criticalThreshold),
        upi_id: upiId.trim(),
        payment_mode: paymentMode,
        contamination: parseFloat(contamination),
        llm_model: llmModel,
      });
      setSaveSuccess(true);
      await fetchSettings();
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setMediumThreshold(0.40);
    setHighThreshold(0.70);
    setCriticalThreshold(0.88);
    setUpiId('aadityabhardwaj5398@oksbi');
    setPaymentMode('demo');
    setContamination(0.08);
    setLlmModel('gpt-4o-mini');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading SOC settings...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Platform Configuration & Control
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            SOC Platform & Security Engine Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage risk thresholds, UPI payment gateway parameters, Isolation Forest hyperparameters, and LLM synthesis engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }}
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            disabled={saving}
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div style={{
          padding: '1rem 1.25rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          color: '#065f46',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <strong style={{ color: '#065f46' }}>Settings Saved Successfully!</strong>
            <div style={{ fontSize: '0.8rem', color: '#047857' }}>
              Multi-signal risk engine thresholds and UPI payment gateway parameters have been updated live in memory.
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-md)',
          color: '#be123c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={20} color="#e11d48" />
          <div>
            <strong>Error Updating Settings</strong>
            <div style={{ fontSize: '0.8rem' }}>{errorMessage}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Risk Engine Calibrated Thresholds */}
          <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="#0066ff" />
              <span>Risk Engine Calibrated Thresholds</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Medium Cutoff */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>
                    MEDIUM Risk Cutoff
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#d97706', fontSize: '1rem' }}>
                    {mediumThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.01"
                  value={mediumThreshold}
                  onChange={(e) => setMediumThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#d97706' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Scores ≥ this value trigger passive session telemetry monitoring and logging.
                </div>
              </div>

              {/* High Cutoff */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>
                    HIGH Risk Cutoff
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#f43f5e', fontSize: '1rem' }}>
                    {highThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.85"
                  step="0.01"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#f43f5e' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Scores ≥ this value enforce Step-up MFA verification and trigger SOC incident broadcasts.
                </div>
              </div>

              {/* Critical Cutoff */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>
                    CRITICAL Risk Cutoff
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#be123c', fontSize: '1rem' }}>
                    {criticalThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="0.98"
                  step="0.01"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#be123c' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Scores ≥ this value place immediate security holds on payments and notify all active analysts.
                </div>
              </div>
            </div>
          </div>

          {/* UPI & Payment Configuration */}
          <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="#10b981" />
              <span>UPI Payment & Gateway Environment</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  Merchant UPI ID (VPA)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="aadityabhardwaj5398@oksbi"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Target Virtual Payment Address encoded in dynamic payable UPI QR payloads.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  Payment Execution Mode
                </label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="demo">Demo / Sandbox Mode (₹0 & Simulated Verification)</option>
                  <option value="live">Live UPI Mode (Real-World Intent Processing)</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Demo mode guarantees safe local evaluations with clear demo disclosures.
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                Currency: <strong style={{ color: '#0066ff' }}>INR (₹ Indian Rupee)</strong> • Provider: <strong style={{ color: '#0f172a' }}>NPCI / UPI Protocol Direct</strong>
              </div>
            </div>
          </div>

          {/* Machine Learning & Anomaly Detection */}
          <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="#8b5cf6" />
              <span>AI/ML Anomaly Detector Hyperparameters</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>
                    Isolation Forest Contamination Rate
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#8b5cf6', fontSize: '1rem' }}>
                    {contamination}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.20"
                  step="0.01"
                  value={contamination}
                  onChange={(e) => setContamination(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#8b5cf6' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Expected fraction of outliers in behavioral traffic data (default: 0.08).
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#faf5ff', borderRadius: 'var(--radius-sm)', border: '1px solid #e9d5ff', fontSize: '0.8rem', color: '#6b21a8' }}>
                Ensemble Trees: <strong>120 Trees</strong> • Scaler: <strong>StandardScaler</strong> • Features: <strong>14 Behavioral Dimensions</strong>
              </div>
            </div>
          </div>

          {/* LLM Synthesis Configuration */}
          <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#0284c7" />
              <span>LLM Threat Synthesis Model</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  Selected Synthesis Model
                </label>
                <select
                  className="form-select"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Effective)</option>
                  <option value="gpt-4o">gpt-4o (Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Low Latency)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet (High Precision)</option>
                  <option value="deterministic-rule-synthesizer">Deterministic Rule Synthesizer (Offline Fallback)</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Used solely for explaining structured numerical XAI evidence into natural language SOC notes.
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f0f9ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd', fontSize: '0.8rem', color: '#0369a1' }}>
                Status: <strong>{config?.llm?.is_configured ? 'API KEY CONFIGURED' : 'ACTIVE WITH DETERMINISTIC FALLBACK'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }}
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Applying Settings...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
