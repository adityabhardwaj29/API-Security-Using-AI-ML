import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, MapPin, Package, Heart, Mail, Phone, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // New address state
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'addresses') {
        const res = await api.get('/addresses');
        setAddresses(res.data || []);
      } else if (activeTab === 'orders') {
        const res = await api.get('/orders');
        setOrders(res.data || []);
      } else if (activeTab === 'wishlist') {
        const res = await api.get('/wishlist');
        setWishlist(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', {
        full_name: fullName,
        phone,
        address_line: addressLine,
        city,
        state: stateName,
        postal_code: postalCode,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [res.data, ...prev]);
      setShowAddAddr(false);
      setAddressLine('');
      setCity('');
      setStateName('');
      setPostalCode('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>My Account & Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Manage your personal details, delivery addresses, order history, and security preferences.
        </p>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'info', label: 'Personal Information', icon: User },
          { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
          { id: 'orders', label: 'Orders & Tracking', icon: Package },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'security', label: 'Security & Sessions', icon: Shield },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <IconComp size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'info' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{user?.name}</h2>
              <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#e0f2fe', color: '#0369a1', marginTop: '0.35rem' }}>
                {user?.role} ACCOUNT
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name</div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{user?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Registered Email</div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={16} style={{ color: '#0284c7' }} /> {user?.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Primary Phone</div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={16} style={{ color: '#0284c7' }} /> +91 98765 43210
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Account Status</div>
              <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Verified Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Saved Delivery Addresses</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage standard and express delivery addresses.</p>
            </div>
            <button
              onClick={() => setShowAddAddr(!showAddAddr)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {showAddAddr && (
            <form onSubmit={handleAddAddress} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Enter New Address Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} />
                <input type="text" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} />
              </div>
              <input type="text" placeholder="Flat / House No. / Street" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginBottom: '0.75rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} />
                <input type="text" placeholder="State" required value={stateName} onChange={(e) => setStateName(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} />
                <input type="text" placeholder="6-digit PIN" maxLength={6} required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}>Save Address</button>
                <button type="button" onClick={() => setShowAddAddr(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {addresses.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {a.full_name} <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>({a.phone})</span>
                    {a.is_default && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontWeight: 700 }}>DEFAULT</span>}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {a.address_line}, {a.city}, {a.state} - {a.postal_code}
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(a.id)} style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Recent Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              No orders placed yet. <Link to="/products" style={{ color: '#0284c7', fontWeight: 600 }}>Browse our catalog</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((o) => (
                <div key={o.id} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Order #{o.id}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {o.items?.length || 1} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>₹{o.final_amount.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', background: '#ecfdf5', color: '#059669' }}>
                      ● {o.status}
                    </span>
                  </div>
                  <Link to={`/orders/${o.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0284c7', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Track Order <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Wishlist Shortcut */}
      {activeTab === 'wishlist' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <Heart size={48} style={{ color: '#e11d48', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Wishlist Manager
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            View and manage all items saved to your favorites.
          </p>
          <Link to="/wishlist" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span>Open My Wishlist</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Tab 5: Security */}
      {activeTab === 'security' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Account Security & Telemetry Controls
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Sliding-Window Behavioral Telemetry</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Monitors velocity & sequence transitions for account takeover defense.</div>
              </div>
              <CheckCircle2 size={20} style={{ color: '#059669' }} />
            </div>

            <div style={{ padding: '1rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Adaptive Step-Up MFA Challenge</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Triggers dynamic 6-digit challenge token if anomaly score crosses threshold.</div>
              </div>
              <CheckCircle2 size={20} style={{ color: '#059669' }} />
            </div>

            <div style={{ padding: '1rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Password Hash Security</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Salted bcrypt hashing algorithm protecting credential store.</div>
              </div>
              <CheckCircle2 size={20} style={{ color: '#059669' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
