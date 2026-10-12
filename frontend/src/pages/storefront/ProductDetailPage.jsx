import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { SizeGuideModal } from '../../components/common/SizeGuideModal.jsx';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Star,
  CheckCircle,
  Plus,
  Minus,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export const ProductDetailPage = ({ onOpenSizeGuide }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant & Selection States
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('features'); // 'features', 'materials', 'shipping'
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Review Form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.getProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          setReviews(res.reviews || []);
          setSelectedVariantIndex(0);
          setSelectedImageIndex(0);

          // Auto-select first in-stock size if available
          const firstVariant = res.product.variants?.[0];
          if (firstVariant?.sizes?.length) {
            const inStock = firstVariant.sizes.find((s) => s.stock > 0);
            if (inStock) setSelectedSize(inStock.size);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active Images derive from selected color variant or fallback to product default
  const displayImages = activeVariant?.images?.length
    ? activeVariant.images
    : product.defaultImages?.length
    ? product.defaultImages
    : [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85' }];

  const currentPrice = activeVariant?.salePrice || product.baseSalePrice;
  const regularPrice = activeVariant?.regularPrice || product.baseRegularPrice;
  const discountPercent = regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;
  const isFavorited = isInWishlist(product._id);

  // Check specific stock for selected size
  const selectedSizeObj = activeVariant?.sizes?.find((s) => s.size === selectedSize);
  const isSelectedSizeAvailable = selectedSizeObj && selectedSizeObj.stock > 0;
  const availableStock = selectedSizeObj?.stock || 0;

  const handleColorChange = (idx) => {
    setSelectedVariantIndex(idx);
    setSelectedImageIndex(0);
    // Check if current selected size is in stock on newly selected color
    const newVariant = variants[idx];
    const match = newVariant?.sizes?.find((s) => s.size === selectedSize && s.stock > 0);
    if (!match) {
      const firstAvailable = newVariant?.sizes?.find((s) => s.stock > 0);
      setSelectedSize(firstAvailable ? firstAvailable.size : '');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a footwear size before adding to bag.');
      return;
    }
    if (!isSelectedSizeAvailable) {
      alert('Selected size is out of stock.');
      return;
    }

    setAddingToCart(true);
    await addToCart(product._id, activeVariant._id, selectedSize, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert('Please select a footwear size before proceeding.');
      return;
    }
    setAddingToCart(true);
    await addToCart(product._id, activeVariant._id, selectedSize, quantity);
    setAddingToCart(false);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setReviewSubmitting(true);
      const res = await api.createReview({
        productId: product._id,
        ...newReview,
      });
      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewSuccessMsg('Your verified review has been published!');
        setNewReview({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
        setTimeout(() => setReviewFormOpen(false), 2000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 0 100px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" style={{ color: 'var(--text-secondary)' }}>Footwear</Link>
          <ChevronRight size={14} />
          {product.category?.name && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} style={{ color: 'var(--text-secondary)' }}>
                {product.category.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: 'var(--ink-black)', fontWeight: 700 }}>{product.name}</span>
        </div>

        {/* Master PDP Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', marginBottom: '80px' }} className="pdp-layout-grid">
          {/* Left Column: Multi-Image Editorial Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Main Stage Image */}
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: '#f4f2ec',
                aspectRatio: '1 / 1.05',
                position: 'relative',
                border: '1px solid var(--border-light)',
              }}
            >
              <img
                src={displayImages[selectedImageIndex]?.url || displayImages[0]?.url}
                alt={displayImages[selectedImageIndex]?.alt || product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Floating badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                {product.isBestseller && <span className="badge-lime">🔥 BESTSELLER</span>}
              </div>

              {/* Wishlist Button */}
              <button
                className={`card-wishlist-btn ${isFavorited ? 'active' : ''}`}
                style={{ width: '44px', height: '44px' }}
                onClick={() => toggleWishlist(product._id)}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Thumbnail Row */}
            {displayImages.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: i === selectedImageIndex ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                      flexShrink: 0,
                      background: '#f4f2ec',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Footwear Buying Controller */}
          <div>
            {/* Brand & Audience */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {product.brand} // {product.audience}
              </span>
              {product.averageRating > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{product.averageRating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({product.totalReviews})</span>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '16px', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            {/* Live Pricing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
                ₹{currentPrice?.toLocaleString('en-IN')}
              </span>
              {regularPrice > currentPrice && (
                <>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{regularPrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="badge-lime" style={{ fontSize: '0.8rem' }}>
                    SAVE {discountPercent}%
                  </span>
                </>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(Incl. of all taxes)</span>
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
              {product.shortDescription}
            </p>

            {/* 1. COLOR VARIANTS SELECTOR (MANDATORY REQUIREMENT) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                  Color: <strong style={{ color: 'var(--ink-black)' }}>{activeVariant?.colorName}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  SKU: {activeVariant?.variantSku || product.sku}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {variants.map((v, idx) => {
                  const isSel = idx === selectedVariantIndex;
                  return (
                    <button
                      key={v._id || idx}
                      onClick={() => handleColorChange(idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: isSel ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                        background: isSel ? '#ffffff' : 'transparent',
                        fontWeight: isSel ? 800 : 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: v.colorHex || '#111111',
                          border: '1px solid rgba(0,0,0,0.2)',
                        }}
                      />
                      <span>{v.colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SIZE SELECTOR WITH INVENTORY MATRIX (MANDATORY REQUIREMENT) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                  Select Size (UK/India): <strong style={{ color: 'var(--ink-black)' }}>{selectedSize || 'Choose Size'}</strong>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--ink-black)',
                    textDecoration: 'underline',
                  }}
                >
                  <Ruler size={14} /> Size Guide
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {activeVariant?.sizes?.map((sz) => {
                  const isSelected = selectedSize === sz.size;
                  const isOutOfStock = sz.stock <= 0;

                  return (
                    <button
                      key={sz.size}
                      onClick={() => !isOutOfStock && setSelectedSize(sz.size)}
                      disabled={isOutOfStock}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: isSelected
                          ? '2px solid var(--ink-black)'
                          : isOutOfStock
                          ? '1px dashed #d1cfc7'
                          : '1px solid var(--border-light)',
                        background: isSelected ? 'var(--ink-black)' : isOutOfStock ? '#f8f7f4' : '#ffffff',
                        color: isSelected ? '#ffffff' : isOutOfStock ? '#a0a0a6' : 'var(--ink-black)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sz.size}
                      {isOutOfStock && (
                        <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.55rem', color: '#dc2626' }}>
                          SOLD
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Real Inventory Status Alert */}
              <div style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                {selectedSize ? (
                  isSelectedSizeAvailable ? (
                    availableStock <= 5 ? (
                      <span style={{ color: '#ea580c', fontWeight: 700 }}>
                        ⚠️ Only {availableStock} pairs remaining in {selectedSize}! Order soon.
                      </span>
                    ) : (
                      <span style={{ color: '#166534', fontWeight: 700 }}>
                        ✓ In Stock ({availableStock} units available) — Ready to Dispatch
                      </span>
                    )
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>✕ Size {selectedSize} is currently Sold Out</span>
                  )
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Select your size above to check availability.</span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1.5px solid var(--ink-black)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 12px',
                  gap: '12px',
                  background: '#ffffff',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '4px' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock || 10, quantity + 1))}
                  style={{ padding: '4px' }}
                  disabled={quantity >= availableStock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="btn-primary btn-lime"
                style={{ flexGrow: 1, padding: '16px 28px' }}
                onClick={handleAddToCart}
                disabled={addingToCart || !isSelectedSizeAvailable}
              >
                <ShoppingBag size={18} />
                {addingToCart ? 'ADDING...' : isSelectedSizeAvailable ? 'ADD TO BAG' : 'OUT OF STOCK'}
              </button>

              <button
                className="btn-primary"
                style={{ padding: '16px 28px' }}
                onClick={handleBuyNow}
                disabled={addingToCart || !isSelectedSizeAvailable}
              >
                BUY NOW
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '20px 16px',
                background: '#faf8f5',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                marginBottom: '36px',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <div>
                <Truck size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                <span>Free Express Shipping</span>
              </div>
              <div>
                <RotateCcw size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                <span>7-Day Easy Exchange</span>
              </div>
              <div>
                <ShieldCheck size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                <span>6 Months Warranty</span>
              </div>
            </div>

            {/* Product Accordion / Tabs */}
            <div style={{ borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)' }}>
                {['features', 'materials', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '16px 0',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      borderBottom: activeTab === tab ? '2px solid var(--ink-black)' : '2px solid transparent',
                      color: activeTab === tab ? 'var(--ink-black)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {tab === 'features' ? 'Features & Details' : tab === 'materials' ? 'Material Science' : 'Shipping & Returns'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px 0', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {activeTab === 'features' && (
                  <div>
                    <p style={{ marginBottom: '16px' }}>{product.description}</p>
                    {product.features?.length > 0 && (
                      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {product.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {activeTab === 'materials' && (
                  <div>
                    <p><strong>Upper Material:</strong> {product.material}</p>
                    <p><strong>Sole Material:</strong> {product.soleMaterial}</p>
                    <p><strong>Closure:</strong> {product.closureType}</p>
                    <p><strong>Weight:</strong> {product.weightGrams} grams per shoe (Ultralight)</p>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div>
                    <p>Dispatched from our Bengaluru hub within 24 hours. Metro deliveries arrive in 2-4 business days.</p>
                    <p>Includes free size exchange pickup right at your doorstep.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '64px', borderTop: '1px solid var(--border-light)', paddingTop: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">COMMUNITY REVIEWS</span>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>CUSTOMER FEEDBACK</h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setReviewFormOpen(!reviewFormOpen)}
            >
              WRITE A REVIEW
            </button>
          </div>

          {/* Write Review Form */}
          {reviewFormOpen && (
            <form
              onSubmit={handleReviewSubmit}
              className="glass-panel"
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
                marginBottom: '40px',
                maxWidth: '680px',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Write Your Verified Review</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ cursor: 'pointer' }}
                    >
                      <Star size={24} fill={star <= newReview.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.customerName}
                    onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Email (for Verified Badge)
                  </label>
                  <input
                    type="email"
                    value={newReview.customerEmail}
                    onChange={(e) => setNewReview({ ...newReview, customerEmail: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best clogs for monsoon walking"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Your Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the arch comfort, sizing, and durability..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                />
              </div>

              {reviewSuccessMsg && (
                <div style={{ color: '#166534', fontWeight: 700, marginBottom: '16px' }}>{reviewSuccessMsg}</div>
              )}

              <button type="submit" className="btn-primary" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'SUBMITTING...' : 'POST VERIFIED REVIEW'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', color: '#f59e0b' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  {rev.title && <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>"{rev.title}"</div>}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {rev.comment}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{rev.customerName}</span>
                    {rev.verifiedPurchase && (
                      <span style={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', color: 'var(--text-muted)' }}>
              Be the first to review the {product.name}!
            </div>
          )}
        </div>

        {/* Related Footwear Recommendations */}
        {product.relatedProducts?.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-light)', paddingTop: '64px' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '32px' }}>YOU MIGHT ALSO DIG</h3>
            <div className="product-grid">
              {product.relatedProducts.slice(0, 4).map((rp) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
};
