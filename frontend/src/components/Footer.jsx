import React from 'react';
import { Shield, Lock, Activity, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#06090e',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 1.5rem 2rem',
      color: '#64748b',
      fontSize: '0.875rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              <Shield size={20} color="#38bdf8" />
              <span>API SECURITY USING AI/ML</span>
            </div>
            <p style={{ lineHeight: '1.6', color: '#94a3b8' }}>
              Real-world full-stack defense platform integrating behavioral telemetry, Isolation Forest baseline, PyTorch Graph Neural Networks, SHAP XAI, and LLM Threat Synthesis.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: '700', marginBottom: '0.75rem' }}>Core Modules</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} color="#3b82f6" /> Real-time Audit Logger</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={14} color="#06b6d4" /> Isolation Forest & PyTorch GNN</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={14} color="#10b981" /> SHAP Feature Attribution</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14} color="#f43f5e" /> Live SOC Operations Center</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: '700', marginBottom: '0.75rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="/products">Browse Product Catalog</a></li>
              <li><a href="/dashboard">User Security Center</a></li>
              <li><a href="/admin/dashboard">Admin SOC Dashboard</a></li>
              <li><a href="/admin/simulator">Security Attack Simulator</a></li>
            </ul>
          </div>
        </div>

        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>© 2026 API Security AI/ML Platform. Production & Academic Research Architecture.</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10b981' }}>
            ● Pipeline Operational — Zero-Trust Active
          </div>
        </div>
      </div>
    </footer>
  );
};
