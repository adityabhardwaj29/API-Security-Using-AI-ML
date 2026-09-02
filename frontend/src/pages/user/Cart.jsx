import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Shield, Plus, Minus } from 'lucide-react';
import api from '../../services/api';

export const Cart = () => {
  const [cart, setCart] = useState({ items: [], total_items: 0, total_amount: 0, currency: 'INR' });
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useOutletContext() || {};
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      await fetchCart();
      if (refreshCart) refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      if (refreshCart) refreshCart();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
      if (refreshCart) refreshCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  if (loading) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '4rem' }}>Loading cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="main-content" style={{ maxWidth: '600px', textAlign: 'center', padding: '5rem 1.5rem' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 102, 255, 0.12)',
            color: '#38bdf8',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}>
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', marginBottom: '2rem' }}>
            Explore our curated Indian e-commerce catalog and add items to your cart.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <span>Browse Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.total_amount;
  const discount = subtotal > 999 ? 100 : 0;
  const finalAmount = Math.max(subtotal - discount, 0);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">Review items and discounts before proceeding to UPI checkout</p>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontWeight: '700', color: '#ffffff' }}>Items in Cart ({cart.total_items})</span>
              <button
                onClick={handleClearCart}
                className="btn btn-secondary btn-sm"
                style={{ color: '#fb7185' }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.product?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                      alt={item.product?.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                        {item.product?.name}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '700', marginTop: '0.2rem' }}>
                        ₹{item.product?.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ background: 'transparent', color: '#ffffff', padding: '0.3rem', display: 'flex' }}
                        title="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 0.5rem', fontWeight: '700', fontSize: '0.875rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ background: 'transparent', color: '#ffffff', padding: '0.3rem', display: 'flex' }}
                        title="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#fb7185', padding: '0.45rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem' }}>
            Price Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Subtotal ({cart.total_items} items)</span>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span>Discount Applied</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Delivery Charges</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>Total Amount</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8' }}>
                ₹{finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <button
              onClick={() => navigate('/checkout', { state: { subtotal, discount, finalAmount } })}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
            <Shield size={15} color="#10b981" />
            <span>Guaranteed secure UPI checkout & telemetry inspection.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
