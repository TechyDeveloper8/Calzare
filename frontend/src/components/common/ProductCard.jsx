import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product._id);
  const variants = product.variants || [];

  // Active color variant state (defaults to first variant or product base)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active image derived from active variant or product default
  const activeImages = activeVariant?.images?.length
    ? activeVariant.images
    : product.defaultImages?.length
    ? product.defaultImages
    : [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' }];

  const currentPrice = activeVariant?.salePrice || product.baseSalePrice;
  const regularPrice = activeVariant?.regularPrice || product.baseRegularPrice;
  const discountPercent = regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  // Handle quick add (adds first in-stock size of current color)
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeVariant) {
      if (onQuickView) onQuickView(product);
      return;
    }

    const availableSize = activeVariant.sizes?.find((s) => s.stock > 0);
    if (availableSize) {
      await addToCart(product._id, activeVariant._id, availableSize.size, 1);
    } else {
      if (onQuickView) onQuickView(product);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-media">
        <img
          src={activeImages[0]?.url}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="card-top-badges">
          {product.isBestseller && <span className="badge-lime">🔥 BESTSELLER</span>}
          {product.isNewArrival && !product.isBestseller && <span className="badge-black">⚡ NEW ARRIVAL</span>}
        </div>

        {/* Wishlist Heart Button */}
        <button
          className={`card-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Actions on Hover */}
        <div className="card-quick-actions">
          <button className="btn-card-quickadd" onClick={handleQuickAdd}>
            + QUICK ADD
          </button>
        </div>
      </Link>

      <div className="product-card-body">
        {/* Color Swatches */}
        {variants.length > 1 && (
          <div className="card-swatches-row">
            {variants.slice(0, 5).map((v, idx) => (
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
              >
                <div className="swatch-fill" style={{ backgroundColor: v.colorHex || '#111111' }} />
              </button>
            ))}
            {variants.length > 5 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{variants.length - 5}</span>
            )}
          </div>
        )}

        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        {/* Category / Material tag */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {activeVariant ? activeVariant.colorName : product.material?.split('/')[0] || 'Dual EVA Foam'}
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
