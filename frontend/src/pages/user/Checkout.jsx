import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, QrCode, Lock, ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], total_items: 0, total_amount: 0 });
  const [shippingAddress, setShippingAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103');
  const [recipientName, setRecipientName] = useState('Priya Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCart(res.data);
        if (res.data.items.length === 0) {
          navigate('/cart');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const subtotal = cart.total_amount;
  const discount = subtotal > 999 ? 100 : 0;
  const finalAmount = Math.max(subtotal - discount, 0);

  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create order in database
      const res = await api.post('/orders', {
        shipping_address: `${recipientName} (${phone}) - ${shippingAddress}`,
        discount: discount,
      });

      const orderData = res.data;

      // 2. Route to payment with order reference
      navigate('/payment', {
        state: {
          orderId: orderData.id,
          amount: finalAmount,
          subtotal: subtotal,
          discount: discount,
          itemsCount: cart.total_items,
        }
      });
    } catch (err) {
      console.error('Order creation error:', err);
      // Fallback navigation
      navigate('/payment', {
        state: {
          amount: finalAmount,
          subtotal: subtotal,
          discount: discount,
          itemsCount: cart.total_items,
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center', padding: '4rem' }}>Preparing checkout...</div>;

  return (
    <div className="main-content" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <h1 className="page-title">Checkout & Order Review</h1>
        <p className="page-subtitle">Confirm delivery address and select UPI payment method in Indian Rupees (₹)</p>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shipping Details */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#38bdf8" />
              <span>1. Delivery Address</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Recipient Full Name</label>
              <input
                type="text"
                className="form-input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Delivery Street Address (India)</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} color="#10b981" />
              <span>2. Payment Option</span>
            </h3>

            <div style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid #0066ff',
              backgroundColor: 'rgba(0, 102, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 102, 255, 0.2)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <QrCode size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1rem' }}>UPI QR Scan & Pay / UPI ID</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI App</div>
                </div>
              </div>

              <span className="badge badge-low">SELECTED</span>
            </div>
          </div>
        </div>

        {/* Order Summary Side */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem' }}>
            Price Breakdown ({cart.total_items} items)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            {cart.items.map((i) => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i.product?.name} ({i.quantity}x)
                </span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>
                  ₹{((i.product?.price || 0) * i.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span>Discount</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>Delivery</span>
              <span>FREE</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.05rem' }}>Total Payable</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8' }}>
                ₹{finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={isSubmitting}
          >
            <Lock size={18} />
            <span>{isSubmitting ? 'Creating Order...' : 'Continue to UPI Pay'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
