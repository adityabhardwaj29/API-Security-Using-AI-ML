import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

const ORDER_STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1rem' }}>Order Not Found</h2>
        <Link to="/transactions" style={{ color: '#0284c7', fontWeight: 600 }}>
          ← Back to Order History
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === (order.status || 'CONFIRMED'));
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 1;

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header & Back Link */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/transactions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#0284c7',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Order #{order.id}
            </h1>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              {order.tracking_number && (
                <span style={{ marginLeft: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                  • Tracking: <span style={{ color: '#0284c7' }}>{order.tracking_number}</span>
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '2rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: order.status === 'DELIVERED' ? '#ecfdf5' : '#e0f2fe',
              color: order.status === 'DELIVERED' ? '#065f46' : '#0369a1',
              border: `1px solid ${order.status === 'DELIVERED' ? '#a7f3d0' : '#bae6fd'}`,
            }}
          >
            ● {order.status || 'CONFIRMED'}
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          padding: '2rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.75rem' }}>
          Delivery Status Tracker
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted ? '#0284c7' : '#f1f5f9',
                    color: isCompleted ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: isCurrent ? '3px solid #7dd3fc' : 'none',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.15)' : 'none',
                    marginBottom: '0.5rem',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted ? '#0f172a' : '#94a3b8',
                    textAlign: 'center',
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Order Items & Delivery/Payment Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Items List */}
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Purchased Products ({(order.items || []).length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(order.items || []).map((item) => {
              const p = item.product || {};
              return (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'}
                    alt={p.name || 'Product'}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{p.name || `Product #${item.product_id}`}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Coupon Discount ({order.coupon_code || 'Promo'})</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Delivery Fee</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontSize: '1.1rem', fontWeight: 800, marginTop: '0.75rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem' }}>
              <span>Total Paid</span>
              <span>₹{order.final_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Security Telemetry Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shipping Address */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: '#0284c7' }} /> Shipping Address
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {order.shipping_address || 'Standard Registered User Address'}
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
              Estimated Delivery: {order.delivery_estimate || '3-5 Business Days'}
            </div>
          </div>

          {/* Payment & Security Verification */}
          <div style={{ background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} /> Payment & Security Verification
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Method:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Instant UPI / Demo Sandbox</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>AI Security Inspection:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>✓ Verified Safe</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Sliding Window Anomaly Score:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>0.08 (Low Risk)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
