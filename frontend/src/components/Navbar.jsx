import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ShoppingCart, User, LogOut, LayoutDashboard, Heart, BookOpen, Menu, X } from 'lucide-react';
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
      backgroundColor: 'rgba(10, 14, 23, 0.95)',
      WebkitBackdropFilter: 'blur(12px)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b',
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
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              API<span style={{ color: '#38bdf8' }}>SEC</span> AI/ML
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Indian E-Commerce Defense Platform
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          <Link to="/products" style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
            Products
          </Link>
          <Link to="/wishlist" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
            <Heart size={16} color="#fda4af" />
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" style={{ position: 'relative', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: '#0284c7',
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
            <Link to="/transactions" style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
              Orders
            </Link>
          )}

          <Link to="/docs" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}>
            <BookOpen size={15} />
            <span>Docs & Viva</span>
          </Link>

          {/* Admin Switcher */}
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            <Shield size={14} />
            <span>ADMIN SOC</span>
          </Link>

          {/* User Profile / Auth Action */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>
                <User size={16} color="#38bdf8" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.35rem 0.65rem', background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', borderRadius: '0.375rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" style={{ color: '#ffffff', background: '#1e293b', border: '1px solid #334155', padding: '0.4rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" style={{ color: '#ffffff', background: '#0284c7', padding: '0.4rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
