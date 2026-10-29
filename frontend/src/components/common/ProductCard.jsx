import { getAssetUrl } from '../../api/api.js';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product._id);
  const variants = product.variants || [];

  // Active color variant state (defaults to first variant or product base)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active images derived from active variant or product default
  const activeImages = activeVariant?.images?.length
    ? activeVariant.images
    : product.defaultImages?.length
    ? product.defaultImages
    : [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' }];

  const currentPrice = activeVariant?.salePrice || product.baseSalePrice;
  const regularPrice = activeVariant?.regularPrice || product.baseRegularPrice;
  const discountPercent =
    regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  // Inventory-aware checks
  const availableSizes = activeVariant?.sizes?.filter((s) => s.stock > 0) || [];
  const isAvailable = availableSizes.length > 0;
  const isBestseller = product.isBestseller || product.salesCount > 30;
  const isNew = product.isNewArrival && !isBestseller;

  // Quick add: adds first in-stock size of current colorway
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) {
      if (onQuickView) onQuickView(product);
      return;
    }

    const availableSize = availableSizes[0];
    if (availableSize) {
      await addToCart(product._id, activeVariant?._id, availableSize.size, 1);
      setQuickAddSuccess(true);
      setTimeout(() => setQuickAddSuccess(false), 2000);
    } else {
      if (onQuickView) onQuickView(product);
    }
  };

  const fallbackPlaceholder = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80';
  const primaryImg = (activeImages[0]?.url && activeImages[0].url.trim() !== '') ? getAssetUrl(activeImages[0].url.trim()) : fallbackPlaceholder;
  const secondaryImg = (activeImages[1]?.url && activeImages[1].url.trim() !== '') ? getAssetUrl(activeImages[1].url.trim()) : null;

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-media" aria-label={`View ${product.name}`}>
        {/* Primary Image */}
        <img
          src={primaryImg}
          alt={product.name}
          className={`product-card-img ${secondaryImg ? 'has-hover' : ''}`}
          loading="lazy"
        />

        {/* Secondary Image on Hover */}
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} alternate view`}
            className="product-card-img-hover"
            loading="lazy"
          />
        )}

        {/* Top Badges */}
        <div className="card-top-badges">
          {!isAvailable ? (
            <span className="badge-black" style={{ background: '#0f0f10', color: '#ffffff' }}>
              SOLD OUT
            </span>
          ) : (
            <>
              {isBestseller && <span className="badge-lime">🔥 BESTSELLER</span>}
              {isNew && <span className="badge-black">⚡ NEW ARRIVAL</span>}
              {discountPercent >= 20 && !isBestseller && !isNew && (
                <span className="badge-lime">{discountPercent}% OFF</span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          className={`card-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          title="Wishlist"
        >
          <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Actions overlay on hover */}
        <div className="card-quick-actions">
          <button
            type="button"
            className="btn-card-quickadd"
            onClick={handleQuickAdd}
            disabled={!isAvailable}
            style={{
              opacity: isAvailable ? 1 : 0.7,
              cursor: isAvailable ? 'pointer' : 'default',
            }}
          >
            {quickAddSuccess ? (
              <>
                <Check size={14} /> ADDED
              </>
            ) : isAvailable ? (
              '+ QUICK ADD'
            ) : (
              'OUT OF STOCK'
            )}
          </button>

          {onQuickView && (
            <button
              type="button"
              className="btn-card-quickview"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Quick view product specs"
              aria-label="Quick View"
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      </Link>

      <div className="product-card-body">
        {/* Color Swatches */}
        {variants.length > 1 && (
          <div className="card-swatches-row" role="radiogroup" aria-label="Available Colorways">
            {variants.slice(0, 6).map((v, idx) => (
              <button
                key={idx}
                type="button"
                className={`card-swatch-circle ${idx === selectedVariantIndex ? 'selected' : ''}`}
                style={{ backgroundColor: 'transparent' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedVariantIndex(idx);
                }}
                title={v.colorName}
                aria-label={v.colorName}
              >
                <div className="swatch-fill" style={{ backgroundColor: v.colorHex || '#111111' }} />
              </button>
            ))}
            {variants.length > 6 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{variants.length - 6}</span>
            )}
          </div>
        )}

        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        {/* Category / Color subtitle */}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {activeVariant ? activeVariant.colorName : product.material?.split('/')[0] || 'Waterproof Cushion Foam'}
        </div>

        {/* Pricing */}
        <div className="product-card-pricing">
          <span className="price-current">₹{currentPrice.toLocaleString('en-IN')}</span>
          {regularPrice > currentPrice && (
            <>
              <span className="price-original">₹{regularPrice.toLocaleString('en-IN')}</span>
              <span className="price-discount-tag">{discountPercent}% OFF</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
