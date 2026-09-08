import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      setMessage({ type: 'success', text: 'Item removed from your wishlist.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to remove item.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleMoveToCart = async (productId) => {
    try {
      await api.post(`/wishlist/move-to-cart/${productId}`);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      setMessage({ type: 'success', text: 'Moved to your shopping cart! 🛒' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to move to cart.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: '#0284c7', fontSize: '1.25rem', fontWeight: 600 }}>Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart style={{ color: '#e11d48', fill: '#e11d48' }} size={28} />
            My Wishlist ({items.length})
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Products saved for later purchase or price drop notifications.
          </p>
        </div>
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: '#f1f5f9',
            color: '#0f172a',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>

      {message && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {items.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Heart size={56} style={{ color: '#94a3b8', margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Your Wishlist is Empty
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.75rem auto' }}>
            Explore our curated catalog of Indian fashion, electronics, home, and beauty products to save your favorites!
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              background: '#0284c7',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.25)',
            }}
          >
            <ShoppingBag size={18} /> Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '220px', background: '#f8fafc' }}>
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleRemove(p.id)}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#e11d48',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                    }}
                  >
                    {p.category}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {p.brand || 'Authentic Indian'}
                  </div>
                  <Link
                    to={`/products/${p.id}`}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      textDecoration: 'none',
                      marginBottom: '0.5rem',
                      lineHeight: '1.35',
                    }}
                  >
                    {p.name}
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {p.original_price && (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{p.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleMoveToCart(p.id)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <ShoppingBag size={16} /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
