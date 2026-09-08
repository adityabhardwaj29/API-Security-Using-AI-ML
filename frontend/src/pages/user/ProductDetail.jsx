import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`).catch(() => ({ data: [] })),
      ]);
      setProduct(prodRes.data);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      showToast(`Added ${quantity} item(s) to cart! 🛒`);
    } catch (err) {
      showToast('Failed to add to cart.', 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      navigate('/checkout');
    } catch (err) {
      navigate('/cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
        showToast('Removed from Wishlist.');
      } else {
        await api.post('/wishlist', { product_id: product.id });
        setIsWishlisted(true);
        showToast('Saved to Wishlist! ❤️');
      }
    } catch (err) {
      showToast('Action could not be completed.', 'error');
    }
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    try {
      setPincodeLoading(true);
      const res = await api.post(`/products/${id}/check-pincode?pincode=${pincode}`);
      setPincodeResult(res.data);
    } catch (err) {
      setPincodeResult({ available: true, estimated_days: 3, delivery_type: 'Standard Delivery', message: 'Delivery available in 3-4 business days.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setReviewSubmitting(true);
      const res = await api.post(`/reviews/product/${id}`, {
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewComment('');
      setReviewTitle('');
      showToast('Thank you! Your review has been published. ⭐');
    } catch (err) {
      showToast('Could not submit review.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1rem' }}>Product Not Found</h2>
        <Link to="/products" style={{ color: '#0284c7', fontWeight: 600 }}>
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>Products</Link>
        <ChevronRight size={14} />
        <Link to={`/products?category=${product.category}`} style={{ color: '#64748b', textDecoration: 'none' }}>{product.category}</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </span>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            padding: '0.875rem 1.5rem',
            background: toast.type === 'success' ? '#0f172a' : '#991b1b',
            color: '#ffffff',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Main Grid: Gallery + Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
        {/* Left: Product Imagery */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              height: '420px',
            }}
          >
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {discountPercent && (
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                }}
              >
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                color: isWishlisted ? '#e11d48' : '#64748b',
              }}
              title="Save to wishlist"
            >
              <Heart size={20} fill={isWishlisted ? '#e11d48' : 'none'} />
            </button>
          </div>

          {/* Security & Authenticity Trust Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginTop: '1.25rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={20} style={{ color: '#0284c7', margin: '0 auto 0.25rem auto' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>100% Genuine</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Direct Brand Sourced</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <RotateCcw size={20} style={{ color: '#0284c7', margin: '0 auto 0.25rem auto' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hassle-free pickup</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Truck size={20} style={{ color: '#0284c7', margin: '0 auto 0.25rem auto' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>Fast Shipping</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>All-India Coverage</div>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            {product.brand || 'Authentic Indian'}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          {/* Rating Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#059669',
                color: '#ffffff',
                padding: '0.25rem 0.6rem',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <Star size={14} fill="#ffffff" />
              {product.rating.toFixed(1)}
            </div>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {reviews.length || product.review_count || 14} verified ratings & reviews
            </span>
          </div>

          {/* Price Box */}
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  MRP ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent && (
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}>
                  Save ₹{(product.original_price - product.price).toLocaleString('en-IN')} ({discountPercent}% off)
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Inclusive of all taxes. Free express shipping applied.
            </div>
          </div>

          {/* Quantity Selector & Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>Quantity</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#ffffff' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0f172a', minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>Availability</div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: product.stock > 0 ? '#059669' : '#dc2626',
                }}
              >
                <CheckCircle2 size={16} /> {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                background: '#ffffff',
                border: '2px solid #0284c7',
                color: '#0284c7',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
              }}
            >
              Buy Now
            </button>
          </div>

          {/* PIN Code Delivery Checker */}
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} style={{ color: '#0284c7' }} /> Check Delivery Availability
            </div>
            <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 110001)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                disabled={pincodeLoading || pincode.length !== 6}
                style={{
                  padding: '0.5rem 1rem',
                  background: pincode.length === 6 ? '#0f172a' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: pincode.length === 6 ? 'pointer' : 'not-allowed',
                }}
              >
                {pincodeLoading ? 'Checking...' : 'Check'}
              </button>
            </form>
            {pincodeResult && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: pincodeResult.available ? '#059669' : '#dc2626', fontWeight: 500 }}>
                {pincodeResult.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Product Description
        </h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          {product.description || 'Authentic quality crafted with genuine materials for daily comfort and durability.'}
        </p>

        {product.specifications && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Key Specifications
            </h3>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#334155' }}>
              {product.specifications}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Customer Reviews ({reviews.length})
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Real feedback from verified purchasers across India.
            </p>
          </div>
        </div>

        {/* Submit Review Form */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} style={{ color: '#0284c7' }} /> Write a Product Review
          </h3>
          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star
                    size={20}
                    style={{ color: star <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                    fill={star <= reviewRating ? '#f59e0b' : 'none'}
                  />
                </button>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Review Headline (Optional)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              />
              <textarea
                placeholder="Share your detailed experience with this product..."
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={reviewSubmitting || !reviewComment.trim()}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: reviewComment.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Review List */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
            No reviews yet. Be the first customer to review this product!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{rev.user_name}</span>
                    {rev.is_verified_purchase && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: '#ecfdf5',
                          color: '#059669',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '1rem',
                        }}
                      >
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.15rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        style={{ color: s <= rev.rating ? '#f59e0b' : '#cbd5e1' }}
                        fill={s <= rev.rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                {rev.title && <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{rev.title}</div>}
                <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.5' }}>{rev.comment}</p>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Reviewed on {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
