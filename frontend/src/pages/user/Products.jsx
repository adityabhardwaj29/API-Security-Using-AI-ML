import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, Check, Star, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Fashion', 'Electronics', 'Home & Lifestyle', 'Beauty & Personal Care']);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const { refreshCart } = useOutletContext() || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingId(product.id);
    try {
      await api.post('/cart', {
        product_id: product.id,
        quantity: 1,
      });

      if (refreshCart) refreshCart();
      setToastMsg(`Added "${product.name}" to cart!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="main-content">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 100,
          background: '#059669',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          fontSize: '0.875rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 className="page-title">Explore Indian E-Commerce Catalog</h1>
          <p className="page-subtitle">Premium curated collections in Indian Rupees (₹) with real-time API security verification</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', width: '180px' }}>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Loading products catalog...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          No products found matching your search.
        </div>
      ) : (
        <div className="grid-3">
          {products.map((product) => (
            <div key={product.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
              {/* Product Image */}
              <div style={{
                height: '210px',
                backgroundColor: '#0f172a',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  WebkitBackdropFilter: 'blur(6px)',
                  backdropFilter: 'blur(6px)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {product.category}
                </span>

                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <Star size={13} fill="#fbbf24" />
                  <span>{product.rating || 4.5}</span>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.4rem' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {product.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Price</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#38bdf8' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                      In Stock ({product.stock})
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={addingId === product.id}
                  >
                    <ShoppingCart size={16} />
                    <span>{addingId === product.id ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
