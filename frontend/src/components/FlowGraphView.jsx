import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Shield, Activity, Users, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './Badge';

export const FlowGraphView = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Compute 2D node layout coordinates in a neat flow topology
  const nodePositions = React.useMemo(() => {
    const pos = {};
    const width = 800;
    const height = 450;
    const n = nodes.length;

    if (n === 0) return pos;

    // Arrange nodes in layered sequence
    nodes.forEach((node, i) => {
      let x, y;
      const id = node.id;
      if (id.includes('/auth/register')) { x = 120; y = 140; }
      else if (id.includes('/auth/login')) { x = 120; y = 280; }
      else if (id.includes('/products')) { x = 320; y = 200; }
      else if (id.includes('/cart')) { x = 480; y = 200; }
      else if (id.includes('/checkout')) { x = 620; y = 160; }
      else if (id.includes('/payment')) { x = 740; y = 220; }
      else if (id.includes('/profile') || id.includes('/users')) { x = 320; y = 360; }
      else if (id.includes('/admin')) { x = 580; y = 360; }
      else {
        const angle = (i / n) * 2 * Math.PI;
        x = width / 2 + 260 * Math.cos(angle);
        y = height / 2 + 160 * Math.sin(angle);
      }
      pos[node.id] = { x, y };
    });

    return pos;
  }, [nodes]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'g') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const getNodeColor = (node) => {
    if (node.is_sensitive) {
      return node.risk_score > 0.5 ? '#e11d48' : '#d97706';
    }
    if (node.risk_score > 0.4) return '#d97706';
    return '#0066ff';
  };

  return (
    <div className="graph-container" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        gap: '0.35rem',
        background: 'rgba(255, 255, 255, 0.95)',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
        padding: '0.35rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #cbd5e1',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        <button className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} onClick={() => handleZoom(0.2)} title="Zoom In">
          <ZoomIn size={15} />
        </button>
        <button className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} onClick={() => handleZoom(-0.2)} title="Zoom Out">
          <ZoomOut size={15} />
        </button>
        <button className="btn btn-secondary btn-sm" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} onClick={handleReset} title="Reset View">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* SVG Canvas */}
      <div
        className="graph-canvas-area"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', background: '#fafbfc' }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ overflow: 'hidden' }}
          viewBox="0 0 900 500"
        >
          <defs>
            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
            <marker
              id="arrow-anom"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((edge, idx) => {
              const srcPos = nodePositions[edge.source];
              const dstPos = nodePositions[edge.target];
              if (!srcPos || !dstPos) return null;

              const isAnom = edge.is_anomalous;
              const strokeColor = isAnom ? '#e11d48' : '#cbd5e1';
              const strokeWidth = Math.min(Math.max(edge.transition_count * 0.5, 1.5), 6);

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={dstPos.x}
                    y2={dstPos.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isAnom ? '4 3' : 'none'}
                    markerEnd={isAnom ? 'url(#arrow-anom)' : 'url(#arrow-normal)'}
                  />
                  <text
                    x={(srcPos.x + dstPos.x) / 2}
                    y={(srcPos.y + dstPos.y) / 2 - 6}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {edge.transition_count}x
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const nodeColor = getNodeColor(node);
              const radius = Math.min(Math.max(16 + Math.log2(node.request_count + 1) * 3, 18), 34);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle r={radius + 8} fill="none" stroke="#0066ff" strokeWidth="2.5" strokeDasharray="4 3" />
                  )}

                  {/* Danger Ring */}
                  {node.risk_score > 0.5 && (
                    <circle r={radius + 5} fill="none" stroke="#e11d48" strokeWidth="1.5" opacity="0.8" />
                  )}

                  <circle
                    r={radius}
                    fill="#ffffff"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                  />

                  {/* Node label */}
                  <text
                    y={radius + 16}
                    fill={isSelected ? '#0066ff' : '#0f172a'}
                    fontSize="11"
                    fontWeight={isSelected ? '800' : '700'}
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {node.label.replace('/api/', '/')}
                  </text>

                  {/* Request count */}
                  <text
                    y="4"
                    fill="#0f172a"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {node.request_count}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Node Inspector Panel */}
      <div className="graph-node-details" style={{ background: '#ffffff', borderLeft: '1px solid #e2e8f0' }}>
        {selectedNode ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                Endpoint Inspector
              </span>
              <RiskBadge level={selectedNode.risk_score > 0.6 ? 'HIGH' : selectedNode.risk_score > 0.35 ? 'MEDIUM' : 'LOW'} score={selectedNode.risk_score} />
            </div>

            <h4 style={{ color: '#0f172a', fontWeight: '800', fontSize: '1rem', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
              {selectedNode.id}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Total Requests:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{selectedNode.request_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Error Count:</span>
                <span style={{ fontWeight: '800', color: selectedNode.error_count > 0 ? '#e11d48' : '#059669' }}>
                  {selectedNode.error_count} ({((selectedNode.error_rate || 0) * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Avg Latency:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{selectedNode.avg_response_time} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Unique Users:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{selectedNode.unique_users}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Sensitive Target:</span>
                <span style={{ fontWeight: '800', color: selectedNode.is_sensitive ? '#e11d48' : '#64748b' }}>
                  {selectedNode.is_sensitive ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#eff6ff', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              💡 Graph transition analysis dynamically checks for sequence skips (e.g. jumping directly into payments without prior cart access).
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
            <Activity size={32} style={{ marginBottom: '0.75rem', color: '#0066ff', opacity: 0.7 }} />
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Select an API Node</div>
            <p style={{ fontSize: '0.78rem' }}>Click on any endpoint node in the graph to inspect flow attributes and transition anomalies.</p>
          </div>
        )}
      </div>
    </div>
  );
};
