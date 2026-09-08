import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, QrCode, Lock, ArrowRight, CheckCircle2, MapPin, Sparkles, Plus, Check } from 'lucide-react';
import api from '../../services/api';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], total_items: 0, total_amount: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // New Address Form
  const [fullName, setFullName] = useState('Priya Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine, setAddressLine] = useState('Flat 402, Lotus Heights, Outer Ring Road');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560103');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discount & Coupon passed from Cart state
  const stateData = location.state || {};
  const passedDiscount = stateData.discount || 0;
  const couponCode = stateData.coupon_code || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          api.get('/cart'),
          api.get('/addresses').catch(() => ({ data: [] })),
        ]);
        setCart(cartRes.data);
        if (cartRes.data.items.length === 0) {
          navigate('/cart');
          return;
        }

        const addrList = addrRes.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const def = addrList.find((a) => a.is_default) || addrList[0];
          setSelectedAddressId(def.id);
        } else {
          setShowNewAddress(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleSaveNewAddress = async () => {
    try {
      const res = await api.post('/addresses', {
        full_name: fullName,
        phone,
        address_line: addressLine,
        city,
        state: stateName,
        postal_code: postalCode,
        is_default: true,
      });
      setAddresses((prev) => [res.data, ...prev]);
      setSelectedAddressId(res.data.id);
      setShowNewAddress(false);
    } catch (err) {
      console.error('Failed to save address', err);
    }
  };

  const subtotal = cart.total_amount;
  const discount = passedDiscount > 0 ? passedDiscount : (subtotal > 999 ? 100 : 0);
  const finalAmount = Math.max(subtotal - discount, 0);

  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    try {
      let selectedAddrStr = `${fullName} (${phone}) - ${addressLine}, ${city}, ${stateName} - ${postalCode}`;
      if (selectedAddressId) {
        const addrObj = addresses.find((a) => a.id === selectedAddressId);
        if (addrObj) {
          selectedAddrStr = `${addrObj.full_name} (${addrObj.phone}) - ${addrObj.address_line}, ${addrObj.city}, ${addrObj.state} - ${addrObj.postal_code}`;
        }
      }

      // 1. Create order in backend
      const res = await api.post('/orders', {
        shipping_address: selectedAddrStr,
        coupon_code: couponCode,
        discount: discount,
      });

      const orderData = res.data;

      // 2. Navigate to payment with real order reference
      navigate('/payment', {
        state: {
          orderId: orderData.id,
          amount: finalAmount,
          subtotal: subtotal,
          discount: discount,
          coupon_code: couponCode,
          itemsCount: cart.total_items,
          shipping_address: selectedAddrStr,
        },
      });
    } catch (err) {
      console.error('Order creation error:', err);
      navigate('/payment', {
        state: {
          amount: finalAmount,
          subtotal: subtotal,
          discount: discount,
          coupon_code: couponCode,
          itemsCount: cart.total_items,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center', padding: '4rem', color: '#0284c7' }}>Preparing checkout...</div>;

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Checkout Progress Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {[
          { num: '1', name: 'Cart', done: true },
          { num: '2', name: 'Address & Review', active: true },
          { num: '3', name: 'Payment (₹0 Demo/UPI)' },
          { num: '4', name: 'Security Check' },
          { num: '5', name: 'Confirmation' },
        ].map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step.done ? '#059669' : step.active ? '#0284c7' : '#e2e8f0',
                color: step.done || step.active ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {step.done ? <Check size={16} /> : step.num}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: step.active ? 700 : 500, color: step.active ? '#0f172a' : '#64748b' }}>
              {step.name}
            </span>
            {idx < 4 && <span style={{ color: '#cbd5e1' }}>—</span>}
          </div>
        ))}
      </div>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Delivery Address & Order Review</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Confirm your shipping details before proceeding to instant UPI payment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Saved Addresses List */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: '#0284c7' }} />
                <span>1. Select Delivery Address</span>
              </h3>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#0284c7',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Plus size={14} /> {showNewAddress ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Existing Address Cards */}
            {addresses.length > 0 && !showNewAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0f9ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: '0.25rem', accentColor: '#0284c7' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          {addr.full_name} <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>({addr.phone})</span>
                          {addr.is_default && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          {addr.address_line}, {addr.city}, {addr.state} - {addr.postal_code}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Street Address / Flat No.</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>PIN Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      maxLength={6}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveNewAddress}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    marginTop: '0.25rem',
                  }}
                >
                  Save & Use Address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Notice */}
          <div style={{ background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} style={{ color: '#0284c7' }} />
              <span>2. UPI & ₹0 Demo Mode Selected</span>
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              On the next screen, you can scan the real dynamic UPI QR code or toggle <strong>🧪 ₹0 Demo Mode</strong> to test the transaction without transferring real funds.
            </p>
          </div>
        </div>

        {/* Order Summary Column */}
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Items Total ({cart.total_items})</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                <span>Coupon / Promotional Discount</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Delivery Charges</span>
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
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Amount Payable</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>
                ₹{finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>{isSubmitting ? 'Placing Order...' : 'Continue to Payment'}</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <Shield size={15} color="#059669" />
            <span>AI Risk Scoring and Sliding Window Telemetry Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
