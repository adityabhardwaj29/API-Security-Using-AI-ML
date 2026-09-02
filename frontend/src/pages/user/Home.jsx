import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Cpu, Activity, ArrowRight, Zap, CheckCircle2, ShoppingBag, Sparkles, QrCode } from 'lucide-react';

export const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 1.5rem 3.5rem',
        background: 'radial-gradient(ellipse at top, rgba(0, 102, 255, 0.18), transparent 70%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(0, 102, 255, 0.12)',
            border: '1px solid rgba(0, 102, 255, 0.35)',
            color: '#38bdf8',
            fontSize: '0.8125rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={15} />
            <span>INDIAN E-COMMERCE & REAL-TIME AI/ML API SECURITY PLATFORM</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            lineHeight: '1.18',
            color: '#ffffff',
            marginBottom: '1.25rem',
          }}>
            Modern Indian E-Commerce with <br />
            <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI, GNN & Multi-Factor API Security
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: '#94a3b8',
            lineHeight: '1.6',
            marginBottom: '2.25rem',
            maxWidth: '740px',
            margin: '0 auto 2.25rem',
          }}>
            A realistic Indian e-commerce marketplace featuring UPI QR Scan & Pay, seamless checkout in Indian Rupees (₹), and an active cybersecurity intelligence core analyzing API flow graphs, behavioral features, Isolation Forests, PyTorch GNNs, and XAI/SHAP threat synthesis.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              <ShoppingBag size={18} />
              <span>Shop Indian Catalog (₹)</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/admin/dashboard" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(0, 102, 255, 0.4)', color: '#38bdf8' }}>
              <Shield size={18} color="#38bdf8" />
              <span>Launch Admin SOC</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories (Section 8) */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore Collections</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>Curated Categories</h2>
          </div>
          <Link to="/products" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#38bdf8' }}>
            View All Products →
          </Link>
        </div>

        <div className="grid-4">
          <Link to="/products?category=Fashion" className="card card-hover" style={{ textDecoration: 'none', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👕</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>Fashion</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>T-Shirts, Jeans, Hoodies, Sneakers, Watches & Bags</p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>From ₹499</div>
          </Link>

          <Link to="/products?category=Electronics" className="card card-hover" style={{ textDecoration: 'none', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>Electronics</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Earbuds, Smart Watches, Power Banks & Chargers</p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>From ₹799</div>
          </Link>

          <Link to="/products?category=Home%20%26%20Lifestyle" className="card card-hover" style={{ textDecoration: 'none', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏡</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>Home & Lifestyle</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Lamps, Flasks, Eco Yoga Mats & Diffusers</p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>From ₹499</div>
          </Link>

          <Link to="/products?category=Beauty%20%26%20Personal%20Care" className="card card-hover" style={{ textDecoration: 'none', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>Beauty & Care</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Face Serums, Grooming Trimmers & Moisturizers</p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>From ₹349</div>
          </Link>
        </div>
      </section>

      {/* Dual Experience Architecture */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>Two Integrated Operational Real-World Environments</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Shop with realistic UPI payment flows while inspecting live SOC telemetry and graph flows.</p>
        </div>

        <div className="grid-2">
          {/* User Application Card */}
          <div className="card card-hover" style={{ borderColor: 'rgba(0, 102, 255, 0.25)', position: 'relative' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 102, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '1.25rem',
            }}>
              <QrCode size={24} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
              Customer E-Commerce Experience
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Register, browse rich Indian categories in INR (₹), manage cart items, and pay using dynamic UPI QR codes with support for safe ₹0 Demo transactions.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Products in Indian Rupees (₹) with search & category filters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Dynamic UPI QR code & copyable UPI ID checkout</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Safe ₹0 demo mode & friendly security challenge warning</li>
            </ul>

            <Link to="/products" className="btn btn-primary" style={{ width: '100%' }}>
              Explore Products Catalog
            </Link>
          </div>

          {/* Admin SOC Card */}
          <div className="card card-hover" style={{ borderColor: 'rgba(0, 102, 255, 0.3)', position: 'relative' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 102, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '1.25rem',
            }}>
              <Shield size={24} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
              Admin Security Operations Center
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Modern White + Blue Neon SOC dashboard receiving real-time WebSocket security incident streams, interactive API flow graphs, XAI/SHAP attributions, and LLM threat synthesis.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#38bdf8" /> Real-time zero-refresh WebSocket security alert stream</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#38bdf8" /> Interactive zoomable NetworkX API flow graph</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#38bdf8" /> XAI/SHAP feature attributions & LLM threat explanation</li>
            </ul>

            <Link to="/admin/dashboard" className="btn btn-secondary" style={{ width: '100%', borderColor: 'rgba(0, 102, 255, 0.4)', color: '#38bdf8' }}>
              Enter Admin SOC Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
