import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, Layers, ShieldCheck, Activity } from 'lucide-react';
import api from '../../services/api';
import { FlowGraphView } from '../../components/FlowGraphView';

export const FlowGraphPage = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    try {
      const res = await api.get('/admin/graph');
      setGraphData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0066ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Structural Network Topology
          </span>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Interactive API Flow Graph
          </h1>
          <p className="page-subtitle" style={{ color: '#64748b' }}>
            Directed behavioral graph modeling endpoint routes (nodes) & user session transitions (weighted edges)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchGraph} className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
            <RefreshCw size={14} />
            <span>Regenerate Flow Graph</span>
          </button>
        </div>
      </div>

      {/* Graph Metrics Ribbon */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.15rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Active Endpoint Nodes</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {graphData?.total_endpoints || 0} Endpoints
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Observed Transitions (Edges)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0066ff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {graphData?.total_transitions || 0} Directed Flows
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>NetworkX Graph Density</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {graphData?.graph_density || 0}
          </div>
        </div>
      </div>

      {/* Flow Graph Canvas */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '6rem', color: '#64748b', background: '#ffffff', borderColor: '#e2e8f0' }}>
          Constructing NetworkX flow graph from historical telemetry...
        </div>
      ) : (
        <FlowGraphView graphData={graphData} />
      )}
    </div>
  );
};
