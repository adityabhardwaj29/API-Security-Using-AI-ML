import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

export const XAIBarChart = ({ features = [], method = 'SHAP' }) => {
  if (!features || features.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1.5rem', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-lg)' }}>
        No feature attribution data recorded.
      </div>
    );
  }

  const isShap = method.toUpperCase() === 'SHAP';

  const getDirectionIcon = (direction) => {
    if (direction === 'INCREASES_RISK') {
      return <ArrowUpRight size={15} color="#e11d48" />;
    } else if (direction === 'DECREASES_RISK') {
      return <ArrowDownRight size={15} color="#10b981" />;
    }
    return <Minus size={15} color="#64748b" />;
  };

  const getBarClass = (level) => {
    switch ((level || 'LOW').toUpperCase()) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div className="xai-panel" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h4 style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.1rem' }}>
            Explainable AI (XAI) Feature Attributions
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Method: <strong style={{ color: isShap ? '#0066ff' : '#d97706' }}>{method}</strong>
          </p>
        </div>

        {!isShap && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#b45309',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <Info size={14} />
            <span>SHAP unavailable — displaying fallback feature evidence.</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {features.map((item, idx) => {
          const importancePct = Math.round((item.importance || 0) * 100);
          const barClass = getBarClass(item.importance_level);

          return (
            <div key={idx} className="xai-bar-row">
              <div className="xai-bar-header" style={{ color: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {getDirectionIcon(item.direction)}
                  <span style={{ color: '#0f172a', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{item.feature}</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    (Observed: {typeof item.observed_value === 'number' ? item.observed_value.toFixed(1) : item.observed_value})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: barClass === 'critical' ? '#e11d48' : barClass === 'high' ? '#f43f5e' : barClass === 'medium' ? '#d97706' : '#059669'
                  }}>
                    {importancePct}% ({item.importance_level})
                  </span>
                </div>
              </div>

              <div className="xai-progress-track" style={{ background: '#f1f5f9' }}>
                <div
                  className={`xai-progress-fill ${barClass}`}
                  style={{ width: `${Math.max(importancePct, 4)}%` }}
                />
              </div>

              {item.description && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
