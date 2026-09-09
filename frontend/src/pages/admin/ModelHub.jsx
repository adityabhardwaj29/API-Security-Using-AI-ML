import React, { useState, useEffect } from 'react';
import { Cpu, Play, CheckCircle2, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Activity, RotateCcw, Zap } from 'lucide-react';
import api from '../../services/api';

export const ModelHub = () => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [trainingGNN, setTrainingGNN] = useState(false);
  const [gnnTrainResult, setGnnTrainResult] = useState(null);
  const [trainingIF, setTrainingIF] = useState(false);
  const [ifTrainResult, setIfTrainResult] = useState(null);

  const fetchEvaluation = async () => {
    try {
      const res = await api.get('/admin/models/evaluate');
      setEvaluationData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await api.get('/admin/models/evaluate');
      setEvaluationData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleTrainGNN = async () => {
    setTrainingGNN(true);
    setGnnTrainResult(null);
    try {
      const res = await api.post('/admin/models/train-gnn');
      setGnnTrainResult(res.data);
      await fetchEvaluation();
    } catch (err) {
      console.error(err);
    } finally {
      setTrainingGNN(false);
    }
  };

  const handleRetrainIsolationForest = async () => {
    setTrainingIF(true);
    setIfTrainResult(null);
    try {
      const res = await api.post('/admin/models/retrain-isolation-forest');
      setIfTrainResult(res.data);
      await fetchEvaluation();
    } catch (err) {
      console.error(err);
    } finally {
      setTrainingIF(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Machine Learning & Graph Intelligence Hub
          </span>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            AI/ML & PyTorch GNN Research Center
          </h1>
          <p className="page-subtitle" style={{ color: '#64748b' }}>
            Live scientific benchmark comparisons across Rule-based heuristics, Isolation Forest ensembles, and PyTorch GNN architectures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRetrainIsolationForest}
            className="btn btn-secondary btn-sm"
            disabled={trainingIF}
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#059669' }}
          >
            <RotateCcw size={14} className={trainingIF ? 'animate-spin' : ''} />
            <span>{trainingIF ? 'Calibrating...' : 'Retrain Isolation Forest'}</span>
          </button>

          <button
            onClick={handleTrainGNN}
            className="btn btn-secondary btn-sm"
            disabled={trainingGNN}
            style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0066ff' }}
          >
            <Cpu size={14} className={trainingGNN ? 'animate-spin' : ''} />
            <span>{trainingGNN ? 'Training GNN...' : 'Train PyTorch GNN Model'}</span>
          </button>

          <button
            onClick={handleRunEvaluation}
            className="btn btn-primary btn-sm"
            disabled={evaluating}
          >
            <Play size={14} className={evaluating ? 'animate-spin' : ''} />
            <span>{evaluating ? 'Running Tests...' : 'Run Benchmark Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Isolation Forest Notification */}
      {ifTrainResult && (
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
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <div style={{ fontWeight: '800', color: '#065f46' }}>{ifTrainResult.message}</div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.2rem' }}>
              Ensemble: <strong>{ifTrainResult.n_estimators} Trees</strong> • Contamination: <strong>{ifTrainResult.contamination}</strong> • Status: <strong>{ifTrainResult.status}</strong>
            </div>
          </div>
        </div>
      )}

      {/* GNN Notification */}
      {gnnTrainResult && (
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
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <div style={{ fontWeight: '800', color: '#065f46' }}>{gnnTrainResult.message}</div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.2rem' }}>
              Trained on {gnnTrainResult.details?.nodes_trained} nodes over {gnnTrainResult.details?.epochs} epochs (Loss: {gnnTrainResult.details?.final_loss}). Checkpoint saved to <code>data/gnn_checkpoint.pt</code>.
            </div>
          </div>
        </div>
      )}

      {/* Model Benchmark Table */}
      <div className="card" style={{ marginBottom: '2rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
              Academic & Real-World Detection Metrics
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Calculated on ground-truth labelled test sets (Sample size: {evaluationData?.sample_size || 0}, Normal: {evaluationData?.normal_samples || 0}, Anomalies: {evaluationData?.anomalous_samples || 0})
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
            Evaluated: {evaluationData?.evaluated_at ? new Date(evaluationData.evaluated_at).toLocaleTimeString() : 'Current'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Evaluating model benchmarks...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ background: '#ffffff' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Model Architecture</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Accuracy</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Precision</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Recall</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>F1 Score</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>ROC-AUC</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>False Positive Rate</th>
                  <th style={{ background: '#f8fafc', color: '#475569' }}>Evaluation Status</th>
                </tr>
              </thead>
              <tbody>
                {(evaluationData?.models || []).map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      {m.model_name}
                      {m.notes && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{m.notes}</div>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#0f172a' }}>
                      {m.accuracy !== undefined ? `${(m.accuracy * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                      {m.precision !== undefined ? `${(m.precision * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                      {m.recall !== undefined ? `${(m.recall * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#0066ff' }}>
                      {m.f1_score !== undefined ? `${(m.f1_score * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: '800' }}>
                      {m.roc_auc !== undefined ? `${(m.roc_auc * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: m.false_positive_rate > 0.05 ? '#d97706' : '#059669', fontWeight: '700' }}>
                      {m.false_positive_rate !== undefined ? `${(m.false_positive_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td>
                      <span className="badge badge-low">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline Technical Specifications */}
      <div className="grid-2">
        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="#0066ff" />
            <span>Isolation Forest Baseline Architecture</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6' }}>
            The baseline detector uses an ensemble of 120 isolation trees calibrated with StandardScaler over a 14-dimensional behavioral feature vector (RPM, error rate, transition velocity, failed logins, etc.). Produces calibrated continuous anomaly scores in [0.0, 1.0].
          </p>
        </div>

        <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#0066ff" />
            <span>PyTorch Graph Neural Network (GNN)</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6' }}>
            The structural sequence detector utilizes 2-layer Graph Convolutions with dropout and global mean pooling over normalized adjacency matrices with self-loops. Detects abnormal multi-hop endpoint transition sequences and unauthorized bypass attempts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelHub;
