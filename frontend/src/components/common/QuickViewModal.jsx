import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Check, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantIndex(0);
      setSelectedImageIndex(0);
      setQuantity(1);
      setAdded(false);
      const firstVariant = product.variants?.[0];
      const firstAvailableSize = firstVariant?.sizes?.find((s) => s.stock > 0);
      setSelectedSize(firstAvailableSize?.size || firstVariant?.sizes?.[0]?.size || '');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active images from selected variant or default images
  const images = activeVariant?.images?.length
    ? activeVariant.images
    : product.defaultImages?.length
    ? product.defaultImages
    : [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85' }];

  const currentPrice = activeVariant?.salePrice || product.baseSalePrice;
  const regularPrice = activeVariant?.regularPrice || product.baseRegularPrice;
  const discountPercent = regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  const isFavorited = isInWishlist(product._id);
  const currentSizeObj = activeVariant?.sizes?.find((s) => s.size === selectedSize);
  const isOutOfStock = !activeVariant?.sizes?.some((s) => s.stock > 0);
  const isSelectedSizeOutOfStock = currentSizeObj ? currentSizeObj.stock <= 0 : false;

  const handleVariantSelect = (idx) => {
    setSelectedVariantIndex(idx);
    setSelectedImageIndex(0);
    const newVariant = variants[idx];
    const avail = newVariant?.sizes?.find((s) => s.stock > 0);
    setSelectedSize(avail?.size || newVariant?.sizes?.[0]?.size || '');
  };

  const handleAddToCart = async () => {
    if (!selectedSize || isSelectedSizeOutOfStock || isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product._id, activeVariant?._id, selectedSize, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      alert(err.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 15, 16, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--canvas-warm)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Left Column: Gallery */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#f8f6f0',
                aspectRatio: '1',
                marginBottom: '12px',
                position: 'relative',
              }}
            >
              <img
                src={images[selectedImageIndex]?.url || images[0]?.url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {discountPercent > 0 && (
                <span
                  className="badge-lime"
                  style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}
                >
                  {discountPercent}% OFF
                </span>
              )}

              {isOutOfStock && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 15, 16, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  OUT OF STOCK
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: i === selectedImageIndex ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Add to Cart */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              {product.productType || 'Footwear'} • {product.audience || 'Unisex'}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--ink-black)' }}>
              {product.name}
            </h2>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink-black)' }}>
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {regularPrice > currentPrice && (
                <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  ₹{regularPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="badge-lime" style={{ fontSize: '0.7rem' }}>
                  Save ₹{(regularPrice - currentPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
              {product.shortDescription || product.description?.slice(0, 160) + '...'}
            </p>

            {/* Colorway Swatches */}
            {variants.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                  Colorway: <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{activeVariant?.colorName}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVariantSelect(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: idx === selectedVariantIndex ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                        background: idx === selectedVariantIndex ? '#f8f6f0' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: v.colorHex || '#111111',
                          border: '1px solid #d1d5db',
                          display: 'inline-block',
                        }}
                      />
                      {v.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UK Size Matrix */}
            {activeVariant?.sizes?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Select Size (UK/India)</span>
                  <Link
                    to="/size-guide"
                    onClick={onClose}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                  >
                    Size Guide
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {activeVariant.sizes.map((sz) => {
                    const out = sz.stock <= 0;
                    const selected = sz.size === selectedSize;
                    return (
                      <button
                        key={sz.size}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedSize(sz.size)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: '8px',
                          border: selected ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                          background: selected ? 'var(--ink-black)' : out ? '#f1f5f9' : '#ffffff',
                          color: selected ? '#ffffff' : out ? '#94a3b8' : 'var(--ink-black)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: out ? 'not-allowed' : 'pointer',
                          textDecoration: out ? 'line-through' : 'none',
                          textAlign: 'center',
                          position: 'relative',
                        }}
                      >
                        {sz.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions: Add to Cart + Wishlist */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock || isSelectedSizeOutOfStock}
                className="btn-primary btn-lime"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: '0.88rem',
                  opacity: isOutOfStock || isSelectedSizeOutOfStock ? 0.6 : 1,
                  cursor: isOutOfStock || isSelectedSizeOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {added ? (
                  <>
                    <Check size={18} /> ADDED TO CART
                  </>
                ) : isOutOfStock ? (
                  'OUT OF STOCK'
                ) : isSelectedSizeOutOfStock ? (
                  'SIZE SOLD OUT'
                ) : (
                  <>
                    <ShoppingBag size={18} /> {adding ? 'ADDING...' : 'ADD TO BAG'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                style={{
                  width: '50px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-light)',
                  background: isFavorited ? '#fee2e2' : '#ffffff',
                  color: isFavorited ? '#dc2626' : 'var(--ink-black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                aria-label="Save to Wishlist"
              >
                <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Full Details link */}
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--ink-black)',
                justifyContent: 'center',
                padding: '6px 0',
              }}
            >
              View Full Product Specifications & Sizing <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
