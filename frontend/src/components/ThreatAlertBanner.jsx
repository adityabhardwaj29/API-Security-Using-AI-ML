import React, { useEffect, useState } from 'react';
import { AlertOctagon, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiskBadge } from './Badge';

export const ThreatAlertBanner = ({ threat, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (threat) {
      setVisible(true);
      // Auto-hide after 15 seconds if not dismissed
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [threat, onDismiss]);

  if (!visible || !threat) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      maxWidth: '460px',
      width: 'calc(100% - 48px)',
      backgroundColor: '#180e15',
      border: '2px solid #e11d48',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(225, 29, 72, 0.35)',
      animation: 'slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(225, 29, 72, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f43f5e',
            flexShrink: 0,
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: '#fda4af', letterSpacing: '0.04em' }}>
                🚨 LIVE SECURITY ALERT
              </span>
              <RiskBadge level={threat.risk_level} score={threat.risk_score} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', marginTop: '0.2rem' }}>
              {threat.threat_type}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            if (onDismiss) onDismiss();
          }}
          style={{ background: 'transparent', color: '#94a3b8', padding: '0.2rem' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.75rem', lineHeight: '1.5' }}>
        <strong>Target:</strong> <code style={{ color: '#38bdf8' }}>{threat.endpoint}</code> | <strong>User:</strong> {threat.user_email || 'Anonymous'}
      </div>

      {threat.explanation && (
        <div style={{
          marginTop: '0.6rem',
          padding: '0.6rem 0.75rem',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: '#e2e8f0',
        }}>
          {threat.explanation.slice(0, 140)}...
        </div>
      )}

      <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Link
          to={`/admin/threats/${threat.id}`}
          className="btn btn-danger btn-sm"
          onClick={() => setVisible(false)}
        >
          <span>Investigate Threat</span>
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
};
