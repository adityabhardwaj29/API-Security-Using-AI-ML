import React from 'react';
import { User, Shield, Key, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="main-content" style={{ maxWidth: '750px' }}>
      <div className="page-header">
        <h1 className="page-title">User Account & Security Profile</h1>
        <p className="page-subtitle">Manage your credentials, zero-trust profile, and authentication privileges</p>
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.5rem',
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>{user?.name}</h3>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-critical' : 'badge-low'}`} style={{ marginTop: '0.25rem' }}>
                {user?.role} ROLE
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address</span>
              <div style={{ color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <Mail size={16} color="#94a3b8" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>User Identifier</span>
              <div style={{ color: '#38bdf8', fontWeight: '600', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                UID-100{user?.id}
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Created Timestamp</span>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Active Session'}
              </div>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#10b981" />
            <span>Active Security Controls</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Behavioral Telemetry</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Real-time velocity & sequence monitoring</div>
              </div>
              <CheckCircle2 size={18} color="#10b981" />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Step-Up Challenge MFA</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Adaptive verification on elevated risk</div>
              </div>
              <CheckCircle2 size={18} color="#10b981" />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Password Encryption</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bcrypt 12-round salted hashing</div>
              </div>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
