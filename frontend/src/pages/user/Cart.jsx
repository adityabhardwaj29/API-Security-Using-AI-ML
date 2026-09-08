import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Shield, Plus, Minus, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const Cart = () => {
  const [cart, setCart] = useState({ items: [], total_items: 0, total_amount: 0, currency: 'INR' });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
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

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    try {
      setCouponLoading(true);
      const res = await api.post('/coupons/validate', {
        code,
        cart_total: cart.total_amount,
      });

      if (res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discount: res.data.discount_amount,
        });
        setCouponMsg({ type: 'success', text: res.data.message });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Error applying coupon code.' });
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '4rem', color: '#0284c7' }}>Loading your cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="main-content" style={{ maxWidth: '600px', textAlign: 'center', padding: '5rem 1.5rem', margin: '0 auto' }}>
        <div className="card" style={{ padding: '3rem 2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}>
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Your Shopping Cart is Empty
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '2rem' }}>
            Explore our authentic Indian fashion, electronics, home, and beauty catalog to add products.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span>Browse Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.total_amount;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalAmount = Math.max(subtotal - couponDiscount, 0);

  return (
    <div className="main-content" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>Shopping Cart ({cart.total_items} items)</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>Review items, apply promo coupons, and proceed to secure checkout.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Items in Cart ({cart.total_items})</span>
              <button
                onClick={handleClearCart}
                style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.product?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                      alt={item.product?.name}
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                        {item.product?.name}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '700', marginTop: '0.2rem' }}>
                        ₹{item.product?.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '0.375rem', background: '#ffffff' }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#64748b' }}
                        title="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 0.5rem', fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#64748b' }}
                        title="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', minWidth: '80px', textAlign: 'right' }}>
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.4rem' }}
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

        {/* Order Summary & Coupons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Coupon Box */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={16} style={{ color: '#0284c7' }} /> Apply Promo Coupon
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Enter coupon (e.g. WELCOME50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                }}
              />
              <button
                onClick={() => handleApplyCoupon()}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {couponMsg && (
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: couponMsg.type === 'success' ? '#059669' : '#dc2626', marginBottom: '0.75rem' }}>
                {couponMsg.text}
              </div>
            )}

            {/* Quick Suggestions */}
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <span style={{ fontWeight: 600 }}>Suggested: </span>
              <button
                onClick={() => { setCouponCode('WELCOME50'); handleApplyCoupon('WELCOME50'); }}
                style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', cursor: 'pointer', marginRight: '0.35rem', fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}
              >
                WELCOME50
              </button>
              <button
                onClick={() => { setCouponCode('FESTIVE200'); handleApplyCoupon('FESTIVE200'); }}
                style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', cursor: 'pointer', marginRight: '0.35rem', fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}
              >
                FESTIVE200
              </button>
              <button
                onClick={() => { setCouponCode('SUPERSEC10'); handleApplyCoupon('SUPERSEC10'); }}
                style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}
              >
                SUPERSEC10
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Price Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal ({cart.total_items} items)</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Delivery Fee</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>
                  ₹{finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => navigate('/checkout', { state: { subtotal, discount: couponDiscount, coupon_code: appliedCoupon?.code, finalAmount } })}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <Shield size={14} color="#059669" />
              <span>Guaranteed secure UPI checkout & behavioral AI inspection.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
