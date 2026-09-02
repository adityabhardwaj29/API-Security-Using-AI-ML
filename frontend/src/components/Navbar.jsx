import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = ({ cartCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'rgba(10, 14, 23, 0.92)',
      WebkitBackdropFilter: 'blur(12px)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              API<span style={{ color: '#38bdf8' }}>SEC</span> AI/ML
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Real-World Defense Platform
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link to="/products" style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>
            Products
          </Link>
          <Link to="/cart" style={{ position: 'relative', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', fontSize: '0.9rem' }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: '700',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {user && (
            <>
              <Link to="/dashboard" style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>
                Dashboard
              </Link>
              <Link to="/transactions" style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>
                Transactions
              </Link>
            </>
          )}

          {/* Admin Switcher */}
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fda4af',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: '700',
            }}
          >
            <Shield size={14} />
            <span>ADMIN SOC</span>
          </Link>

          {/* User Profile / Auth Action */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem' }}>
                <User size={16} color="#38bdf8" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
