import React, { useState } from 'react';
import { PlaySquare, Zap, ShieldAlert, CheckCircle2, RefreshCw, ArrowRight, Shield } from 'lucide-react';
import api from '../../services/api';

export const TrafficSimulator = () => {
  const [runningScenario, setRunningScenario] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleRunScenario = async (scenario) => {
    setRunningScenario(scenario);
    setSimulationResult(null);
    try {
      const res = await api.post('/admin/simulate', {
        scenario,
        iterations: 1,
      });
      setSimulationResult(res.data);
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          scenario: res.data.scenario,
          events: res.data.events_generated,
          threats: res.data.threats_detected,
          summary: res.data.summary,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Shield size={14} /> CONTROLLED LOCAL ENVIRONMENT • DEMO / SIMULATED
        </div>
        <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
          Real-World Security Attack Simulator
        </h1>
        <p className="page-subtitle" style={{ color: '#64748b' }}>
          Execute safe, deterministic synthetic traffic scenarios to demonstrate real-time behavioral detection live.
        </p>
      </div>

      {/* Scenario Action Cards */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Scenario A: Normal */}
        <div className="card card-hover" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', letterSpacing: '0.05em' }}>
              SCENARIO A — BASELINE NORMAL
            </span>
            <span className="badge badge-low">LOW RISK</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Normal Shopping Journey
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Simulates a genuine user session: Login → Browse Products → Product Detail → Add to Cart → Checkout → Single Payment.
          </p>

          <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#0f172a', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', border: '1px solid #e2e8f0' }}>
            Flow: /auth/login → /products → /cart → /checkout → /payments
          </div>

          <button
            onClick={() => handleRunScenario('NORMAL_FLOW')}
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={runningScenario !== null}
          >
            <PlaySquare size={16} />
            <span>{runningScenario === 'NORMAL_FLOW' ? 'Generating Normal Traffic...' : 'Execute Scenario A'}</span>
          </button>
        </div>

        {/* Scenario B: Payment Flood */}
        <div className="card card-hover" style={{ background: '#ffffff', borderColor: '#fecdd3', boxShadow: '0 4px 12px rgba(225,29,72,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e11d48', letterSpacing: '0.05em' }}>
              SCENARIO B — VELOCITY ATTACK
            </span>
            <span className="badge badge-critical">HIGH RISK</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            High-Frequency Payment Flood
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Simulates a rapid burst of automated payment attempts on <code>/api/payments</code> within a tight 20-second window.
          </p>

          <div style={{ padding: '0.65rem', background: '#fff1f2', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#be123c', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', border: '1px solid #fecdd3' }}>
            Pattern: 8x /api/payments calls in 20s (Rate limit & Anomaly trigger)
          </div>

          <button
            onClick={() => handleRunScenario('HIGH_FREQUENCY_PAYMENT')}
            className="btn btn-danger"
            style={{ width: '100%' }}
            disabled={runningScenario !== null}
          >
            <Zap size={16} />
            <span>{runningScenario === 'HIGH_FREQUENCY_PAYMENT' ? 'Injecting Payment Burst...' : 'Execute Scenario B'}</span>
          </button>
        </div>

        {/* Scenario C: Unusual API Sequence */}
        <div className="card card-hover" style={{ background: '#ffffff', borderColor: '#fef3c7', boxShadow: '0 4px 12px rgba(217,119,6,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d97706', letterSpacing: '0.05em' }}>
              SCENARIO C — WORKFLOW BYPASS & PROBE
            </span>
            <span className="badge badge-high">HIGH RISK</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Unauthorized Admin Probing
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Non-admin client attempts direct reconnaissance on privileged routes (<code>/admin/threats</code>, <code>/admin/users</code>) and jumps straight to payments.
          </p>

          <div style={{ padding: '0.65rem', background: '#fffbeb', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#b45309', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', border: '1px solid #fef3c7' }}>
            Flow: /auth/login → /admin/threats [403] → /admin/users [403] → /payments
          </div>

          <button
            onClick={() => handleRunScenario('UNUSUAL_API_SEQUENCE')}
            className="btn btn-secondary"
            style={{ width: '100%', borderColor: '#cbd5e1', color: '#d97706', background: '#ffffff' }}
            disabled={runningScenario !== null}
          >
            <ShieldAlert size={16} />
            <span>{runningScenario === 'UNUSUAL_API_SEQUENCE' ? 'Executing Probe Scenario...' : 'Execute Scenario C'}</span>
          </button>
        </div>

        {/* Scenario D: Brute Force Login */}
        <div className="card card-hover" style={{ background: '#ffffff', borderColor: '#fecdd3', boxShadow: '0 4px 12px rgba(225,29,72,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e11d48', letterSpacing: '0.05em' }}>
              SCENARIO D — CREDENTIAL ATTACK
            </span>
            <span className="badge badge-high">HIGH RISK</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Brute-Force Authentication Attempt
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Simulates rapid automated dictionary credential stuffing yielding consecutive 401 Unauthorized responses.
          </p>

          <div style={{ padding: '0.65rem', background: '#fff1f2', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#be123c', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', border: '1px solid #fecdd3' }}>
            Pattern: 6x /api/auth/login failed attempts [401s in 18s]
          </div>

          <button
            onClick={() => handleRunScenario('BRUTE_FORCE_LOGIN')}
            className="btn btn-danger"
            style={{ width: '100%' }}
            disabled={runningScenario !== null}
          >
            <Zap size={16} />
            <span>{runningScenario === 'BRUTE_FORCE_LOGIN' ? 'Running Brute-force Probe...' : 'Execute Scenario D'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Simulation Result Feedback */}
      {simulationResult && (
        <div className="card" style={{
          marginBottom: '2rem',
          backgroundColor: simulationResult.threats_detected > 0 ? '#fff1f2' : '#ecfdf5',
          borderColor: simulationResult.threats_detected > 0 ? '#fecdd3' : '#a7f3d0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {simulationResult.threats_detected > 0 ? (
              <ShieldAlert size={22} color="#e11d48" />
            ) : (
              <CheckCircle2 size={22} color="#059669" />
            )}
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
              Simulation Output: {simulationResult.scenario}
            </h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {simulationResult.summary}
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Events Generated: <strong style={{ color: '#0f172a' }}>{simulationResult.events_generated}</strong> • Threat Records Created: <strong style={{ color: simulationResult.threats_detected > 0 ? '#e11d48' : '#059669' }}>{simulationResult.threats_detected}</strong>
          </div>
        </div>
      )}

      {/* Simulator Execution History */}
      {logs.length > 0 && (
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
            Recent Simulation Runs
          </h3>
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Time</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Scenario</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Events</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Threats</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={idx}>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{l.timestamp}</td>
                    <td style={{ fontWeight: '800', color: '#0066ff' }}>{l.scenario}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{l.events}</td>
                    <td style={{ fontWeight: '800', color: l.threats > 0 ? '#e11d48' : '#059669' }}>{l.threats}</td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>{l.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
