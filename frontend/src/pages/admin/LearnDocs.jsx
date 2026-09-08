import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Cpu,
  Share2,
  Sparkles,
  Bot,
  Activity,
  Layers,
  HelpCircle,
  CheckCircle2,
  FileText,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export function LearnDocs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ padding: '2rem 1.5rem 5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <BookOpen size={14} /> Academic & Project Documentation Guide
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          API Security Using AI/ML — System Architecture & Viva Guide
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '850px', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Comprehensive documentation explaining how real-world Indian E-Commerce telemetry connects to behavioral sliding-window feature engineering, Isolation Forest, NetworkX graphs, PyTorch Geometric GNN, SHAP explainability, and LLM synthesis.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: '1. Executive Overview' },
          { id: 'ecommerce', label: '2. E-Commerce Flow' },
          { id: 'ml-gnn', label: '3. ML & GNN Math' },
          { id: 'xai-llm', label: '4. XAI & LLM Synthesis' },
          { id: 'viva-qa', label: '5. Viva & Defense Q&A' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === tab.id ? '#0f172a' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              The Problem Statement
            </h2>
            <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Modern digital commerce platforms increasingly suffer from sophisticated automated threats—such as <strong>API Credential Stuffing</strong>, <strong>Checkout Sequence Bypasses (IDOR)</strong>, <strong>Payment Brute-Force Probing</strong>, and <strong>Distributed Scraping</strong>.
            </p>
            <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Traditional Web Application Firewalls (WAFs) rely on rigid regular expressions (e.g. searching for <code>' OR 1=1</code>) and fail completely against <em>behavioral anomalies</em> where attackers send syntactically valid requests in abnormal sequences. This project implements a dual-layer behavioral detection engine fusing tabular ML and relational Graph Neural Networks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Product A: Storefront</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Production-grade Indian e-commerce platform with 18 products in INR (₹), cart & checkout, dynamic UPI QR code generator, coupon validation engine, and multi-address management.
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Product B: Security SOC</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                AI/ML Security Operations Center console with real-time WebSocket telemetry, 10-step investigation timeline, SHAP feature importance, and interactive API transition flow graphs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: E-Commerce Flow */}
      {activeTab === 'ecommerce' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            User E-Commerce Lifecycle & Telemetry Ingestion
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { step: '1', title: 'User Registration & JWT Session', desc: 'User registers email and receives an HMAC-SHA256 JWT access token. Passwords hashed using salted bcrypt.' },
              { step: '2', title: 'Product Browsing & PIN Verification', desc: 'Browse catalog filtered by Indian category (Fashion, Electronics, Home, Beauty), sort by price/rating, and check 6-digit delivery PIN codes.' },
              { step: '3', title: 'Wishlist & Cart Operations', desc: 'Add items, adjust quantities, move from wishlist to cart, and apply verified server-side coupons (e.g. WELCOME50, FESTIVE200).' },
              { step: '4', title: 'Checkout & ₹0 Demo Payment', desc: 'Select delivery address, review price breakdown in INR, choose ₹0 Demo Mode or UPI QR Code, and trigger asynchronous backend security check.' },
              { step: '5', title: 'Order Confirmation & Tracking Timeline', desc: 'Order lifecycle advances through PLACED -> CONFIRMED -> PROCESSING -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED.' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ML & GNN Math */}
      {activeTab === 'ml-gnn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              1. 14-Dimensional Sliding-Window Feature Extractor
            </h2>
            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Every active user session is monitored over a 60-second window. The feature extractor computes:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>1. <code>requests_per_minute</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>2. <code>request_count</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>3. <code>unique_endpoints</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>4. <code>error_rate (4xx/5xx)</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>5. <code>average_response_time</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>6. <code>payment_frequency</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>7. <code>failed_login_count</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>8. <code>admin_access_frequency</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>9. <code>sensitive_endpoint_access</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>10. <code>transition_frequency</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>11. <code>status_4xx_ratio</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>12. <code>status_5xx_ratio</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>13. <code>behavior_deviation</code></div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>14. <code>activity_velocity_score</code></div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              2. PyTorch Geometric GraphSAGE Architecture
            </h2>
            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              While Isolation Forest evaluates tabular metrics in isolation, our PyG GraphSAGE network models the <strong>topological API graph</strong>. An attacker skipping <code>/api/cart</code> and directly posting to <code>/api/payments/verify</code> creates a zero-weight or disconnected edge in the transition graph.
            </p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', overflowX: 'auto' }}>
{`class GraphSAGEAnomalyDetector(torch.nn.Module):
    def __init__(self, in_channels=64, hidden_channels=32, out_channels=2):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels, aggr='mean')
        self.conv2 = SAGEConv(hidden_channels, out_channels, aggr='mean')
        
    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: XAI & LLM */}
      {activeTab === 'xai-llm' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Explainable AI (XAI) with SHAP & LLM Synthesizer
          </h2>
          <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            A black-box anomaly score (e.g. <code>Risk: 82</code>) is not actionable for a SOC analyst. This platform explains <strong>why</strong> the event was flagged using two complementary layers:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> SHAP Feature Attribution
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Uses Shapley Additive Explanations (TreeExplainer) to rank exact percentage contributions (e.g., payment_frequency: +38%, requests_per_minute: +29%).
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bot size={16} /> Structured LLM Synthesizer
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Feeds only structured mathematical facts into OpenAI GPT-4o-mini (with a rule-based deterministic fallback if offline) to produce plain-English executive incident summaries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Viva Defense Q&A */}
      {activeTab === 'viva-qa' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Frequently Asked Viva & Examiner Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              {
                q: 'Q1. Why use both Isolation Forest AND Graph Neural Networks?',
                a: 'Isolation Forest inspects tabular feature distributions (e.g. high request volume). However, it cannot comprehend topological sequence order. The GNN models the API graph as nodes (endpoints) and edges (transitions), detecting workflow sequence bypasses that look statistically normal in isolation.',
              },
              {
                q: 'Q2. Does the LLM make the security decision directly?',
                a: 'No. The LLM is NEVER used as the primary detector to prevent hallucinations and latency. The Isolation Forest and GNN make the detection; the LLM strictly serves as an XAI Natural Language Synthesizer converting structured evidence into SOC summaries.',
              },
              {
                q: 'Q3. How is user privacy and payment security maintained?',
                a: 'All sensitive fields (passwords, tokens, UPI PINs, CVVs) are masked prior to structured logging. The system operates in ₹0 Demo / Sandbox mode without transferring real financial funds.',
              },
              {
                q: 'Q4. How does the real-time alerting work without polling?',
                a: 'The backend maintains a persistent FastAPI WebSocket broadcast channel (/ws/admin/security). When an anomaly score crosses the risk threshold, the event is immediately pushed to the connected React SOC Dashboard.',
              },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '0.5rem' }}>{item.q}</div>
                <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LearnDocs;
