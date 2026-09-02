import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@apisecurity.io');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        setError('Access denied: Account does not possess Administrator privileges.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at center, rgba(0, 102, 255, 0.08), #f8fafc 70%)',
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 10px 30px rgba(0, 102, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0066ff, #0284c7)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(0, 102, 255, 0.35)',
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>SOC Administrator Portal</h2>
          <p style={{ color: '#0066ff', fontSize: '0.8125rem', marginTop: '0.35rem', fontWeight: '700', letterSpacing: '0.05em' }}>
            SECURITY OPERATIONS CENTER • RESTRICTED ACCESS
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 'var(--radius-md)',
            color: '#be123c',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#475569' }}>Admin Email</label>
            <input
              type="email"
              className="form-input"
              style={{ background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@apisecurity.io"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#475569' }}>Password</label>
            <input
              type="password"
              className="form-input"
              style={{ background: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating SOC Session...' : 'Authenticate as SOC Admin'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.8125rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
            <ArrowLeft size={14} />
            <span>Return to User Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
