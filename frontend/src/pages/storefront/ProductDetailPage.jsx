import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { SizeGuideModal } from '../../components/common/SizeGuideModal.jsx';
import { BrandComparisonSection } from '../../components/common/BrandComparisonSection.jsx';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Banknote,
  Ruler,
  Star,
  CheckCircle,
  Plus,
  Minus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Maximize2,
  X,
  MapPin,
  Tag,
  Sparkles,
  HelpCircle,
  Info,
  Droplet,
  Feather,
  Shield,
  Wind,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';

export const ProductDetailPage = ({ onQuickView: propOnQuickView }) => {
  const outletCtx = useOutletContext() || {};
  const onQuickView = propOnQuickView || outletCtx?.onQuickView;
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Master Data States
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [globalDefaults, setGlobalDefaults] = useState({});
  const [storePolicy, setStorePolicy] = useState({});
  const [brandComparison, setBrandComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Variant & Visual Gallery States
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Image Zoom & Lightbox States
  const [isZoomed, setIsZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Delivery & Pincode Checker States
  const [pincode, setPincode] = useState(() => localStorage.getItem('calzare_pincode') || '');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState(null);

  // Accordion Toggle States
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    features: false,
    materials: false,
    specs: false,
    shipping: false,
    returns: false,
    faqs: false,
  });

  // Individual FAQ item toggle states
  const [openFaqs, setOpenFaqs] = useState({ 0: true });

  // Review Form States
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Mobile Sticky Bottom Bar Scroll Trigger
  const [showMobileBar, setShowMobileBar] = useState(false);
  const purchaseSectionRef = useRef(null);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (idx) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Dynamic Copy Resolver: Product Specific Override -> Central Store Default -> Application Fallback
  const getCopy = (key, fallback) => {
    return product?.customCopy?.[key] || globalDefaults?.[key] || fallback;
  };

  // Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getProductBySlug(slug);
        if (res.success && res.product) {
          const p = res.product;
          setProduct(p);
          setReviews(res.reviews || []);
          setGlobalDefaults(res.globalDefaults || {});
          setStorePolicy(res.storePolicy || {});
          setBrandComparison(res.brandComparison || null);

          // Match variant from URL query param ?color=
          const colorQuery = searchParams.get('color');
          let initialVariantIdx = 0;
          if (colorQuery && p.variants?.length) {
            const foundIdx = p.variants.findIndex(
              (v) => v.colorName.toLowerCase().replace(/\s+/g, '-') === colorQuery.toLowerCase()
            );
            if (foundIdx !== -1) initialVariantIdx = foundIdx;
          }

          setSelectedVariantIndex(initialVariantIdx);
          setSelectedImageIndex(0);

          // Auto-select first in-stock size if available
          const activeVar = p.variants?.[initialVariantIdx];
          if (activeVar?.sizes?.length) {
            const firstInStock = activeVar.sizes.find((s) => s.stock > 0);
            if (firstInStock) setSelectedSize(firstInStock.size);
          }

          // Dynamic SEO meta tags & canonical link
          document.title = `${p.seoTitle || p.name} — CALZARE Footwear`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute(
              'content',
              p.seoDescription || p.shortDescription || `Shop the ${p.name} at CALZARE. High-density waterproof foam footwear.`
            );
          }
        } else {
          throw new Error(res.message || 'Product not found');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err.message || 'Product could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  // Observer for Mobile Sticky Bottom Purchase Bar
  useEffect(() => {
    const handleScroll = () => {
      if (!purchaseSectionRef.current) return;
      const rect = purchaseSectionRef.current.getBoundingClientRect();
      setShowMobileBar(rect.bottom < 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 size={38} className="animate-spin" color="var(--ink-black)" />
        <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
          FETCHING FOOTWEAR SPECIFICATIONS...
        </span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Product Silhouette Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
          The footwear silhouette you are looking for may have been archived or moved to a different collection drop.
        </p>
        <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px', display: 'inline-flex' }}>
          Explore Full Footwear Drop
        </Link>
      </div>
    );
  }

  // Active Variant and Gallery Media
  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIndex] || null;

  const displayImages = activeVariant?.images?.length
    ? activeVariant.images
    : product.defaultImages?.length
    ? product.defaultImages
    : [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85', alt: product.name }];

  const currentPrice = activeVariant?.salePrice || product.baseSalePrice;
  const regularPrice = activeVariant?.regularPrice || product.baseRegularPrice;
  const discountPercent = regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;
  const isFavorited = isInWishlist(product._id);

  // Stock Calculation for active size
  const selectedSizeObj = activeVariant?.sizes?.find((s) => s.size === selectedSize);
  const isSelectedSizeAvailable = selectedSizeObj && selectedSizeObj.stock > 0;
  const availableStock = selectedSizeObj?.stock || 0;
  const lowStockThreshold = product.customCopy?.lowStockThreshold ?? 5;
  const isLowStock = isSelectedSizeAvailable && availableStock <= lowStockThreshold;

  // Handle Color Variant Switch
  const handleColorChange = (idx) => {
    setSelectedVariantIndex(idx);
    setSelectedImageIndex(0);
    const newVariant = variants[idx];

    if (newVariant?.colorName) {
      const colorSlug = newVariant.colorName.toLowerCase().replace(/\s+/g, '-');
      setSearchParams({ color: colorSlug }, { replace: true });
    }

    const sizeStillAvailable = newVariant?.sizes?.find((s) => s.size === selectedSize && s.stock > 0);
    if (!sizeStillAvailable) {
      const firstAvailable = newVariant?.sizes?.find((s) => s.stock > 0);
      setSelectedSize(firstAvailable ? firstAvailable.size : '');
    }
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Add to Bag Dispatch
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeWarning(true);
      const el = document.getElementById('size-selector-block');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isSelectedSizeAvailable) {
      alert('Selected size is currently sold out in this colorway.');
      return;
    }

    setSizeWarning(false);
    setAddingToCart(true);
    try {
      await addToCart(product._id, activeVariant?._id, selectedSize, quantity);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Direct Buy Now Dispatch
  const handleBuyNow = async () => {
    if (!selectedSize) {
      setSizeWarning(true);
      const el = document.getElementById('size-selector-block');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isSelectedSizeAvailable) {
      alert('Selected size is currently sold out.');
      return;
    }

    setSizeWarning(false);
    setAddingToCart(true);
    try {
      await addToCart(product._id, activeVariant?._id, selectedSize, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error('Buy now failed:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Pincode Delivery Availability Checker
  const handleCheckPincode = async (e) => {
    e?.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      setDeliveryResult({
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code (e.g. 560038).',
      });
      return;
    }

    try {
      setPincodeChecking(true);
      const cleanPin = pincode.trim();
      const res = await api.checkDelivery(cleanPin);
      setDeliveryResult(res);
      if (res.serviceable) {
        localStorage.setItem('calzare_pincode', cleanPin);
      }
    } catch (err) {
      setDeliveryResult({
        serviceable: false,
        message: err.message || 'Serviceability verification failed. Please try again.',
      });
    } finally {
      setPincodeChecking(false);
    }
  };

  // Review Form Submission Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setReviewSubmitting(true);
      setReviewSuccessMsg('');
      const res = await api.createReview({
        productId: product._id,
        ...newReview,
      });

      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewSuccessMsg('Thank you! Your verified review has been posted.');
        setNewReview({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
        setTimeout(() => setReviewFormOpen(false), 2400);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Feature Icon Mapper
  const renderFeatureIcon = (iconName) => {
    switch (iconName) {
      case 'Droplet':
        return <Droplet size={22} />;
      case 'Feather':
        return <Feather size={22} />;
      case 'Shield':
        return <Shield size={22} />;
      case 'Wind':
        return <Wind size={22} />;
      case 'Zap':
        return <Zap size={22} />;
      default:
        return <Sparkles size={22} />;
    }
  };

  // Rating Distribution Calculation
  const totalReviewsCount = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  const displayTitle = getCopy('titleOverride', product.name);
  const displaySubtitle = getCopy(
    'subtitle',
    product.tagline || 'High-Performance Closed-Cell Architectural Foam'
  );
  const displaySellingStatement = getCopy('sellingStatement', '');

  return (
    <div className="pdp-page-wrapper">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: displayImages.map((img) => img.url),
            description: product.shortDescription || product.description,
            sku: activeVariant?.variantSku || product.sku,
            brand: {
              '@type': 'Brand',
              name: 'CALZARE',
            },
            offers: {
              '@type': 'Offer',
              price: currentPrice,
              priceCurrency: 'INR',
              availability: isSelectedSizeAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: window.location.href,
            },
            ...(reviews.length > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.averageRating || 5,
                reviewCount: reviews.length,
              },
            }),
          }),
        }}
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>
              {getCopy('breadcrumbHome', 'Home')}
            </Link>
            <ChevronRight size={13} />
            <Link to="/shop" style={{ color: 'var(--text-secondary)' }}>
              {getCopy('breadcrumbCatalog', 'Footwear')}
            </Link>
            <ChevronRight size={13} />
            {product.audience && (
              <>
                <Link to={`/shop?audience=${product.audience}`} style={{ color: 'var(--text-secondary)' }}>
                  {product.audience}
                </Link>
                <ChevronRight size={13} />
              </>
            )}
            {product.category?.name && (
              <>
                <Link to={`/shop?category=${product.category.slug}`} style={{ color: 'var(--text-secondary)' }}>
                  {product.category.name}
                </Link>
                <ChevronRight size={13} />
              </>
            )}
            <span style={{ color: 'var(--ink-black)', fontWeight: 700 }} aria-current="page">
              {product.name}
            </span>
          </div>
        </nav>

        {/* Master PDP Grid: Left Gallery / Right Purchasing Controls */}
        <div className="pdp-layout-grid" style={{ marginBottom: '80px' }}>
          {/* =======================================================
              LEFT COLUMN: MULTI-IMAGE GALLERY WITH ZOOM & LIGHTBOX
              ======================================================= */}
          <div className="pdp-gallery-sticky">
            {/* Primary Main Stage Image */}
            <div
              className="pdp-stage-container"
              onClick={() => setLightboxOpen(true)}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={displayImages[selectedImageIndex]?.url || displayImages[0]?.url}
                alt={displayImages[selectedImageIndex]?.alt || product.name}
                className={`pdp-stage-image ${isZoomed ? 'is-zoomed' : ''}`}
                fetchpriority="high"
              />

              {/* Badges Overlay */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
                {product.isBestseller && <span className="badge-lime">🔥 BESTSELLER</span>}
                {product.isNewArrival && !product.isBestseller && <span className="badge-black">⚡ NEW ARRIVAL</span>}
                {discountPercent > 0 && (
                  <span style={{ background: 'var(--ink-black)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-pill)', letterSpacing: '0.04em' }}>
                    {discountPercent}% SAVINGS
                  </span>
                )}
              </div>

              {/* Expand Lightbox Button */}
              <button
                type="button"
                className="action-icon-btn"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  zIndex: 2,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                aria-label="Enlarge product image"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Thumbnail Navigation Strip */}
            {displayImages.length > 1 && (
              <div className="pdp-gallery-thumbs" role="tablist" aria-label="Product media gallery">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`pdp-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img.url} alt={img.alt || `${product.name} angle ${idx + 1}`} className="pdp-thumb-img" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =======================================================
              RIGHT COLUMN: PURCHASING & VARIANT CONTROLS
              ======================================================= */}
          <div ref={purchaseSectionRef}>
            {/* Product Title */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.2vw, 2.6rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--ink-black)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              {displayTitle}
            </h1>

            {/* Subtitle / Tagline */}
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {displaySubtitle}
            </p>

            {/* Genuine Reviews Summary */}
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(product.averageRating || 5) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ink-black)' }}>
                  {(product.averageRating || 5).toFixed(1)}
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  ({reviews.length} verified customer reviews)
                </span>
              </div>
            )}

            {/* Price Area */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-black)' }}>
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {regularPrice > currentPrice && (
                <>
                  <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px' }}>
                    SAVE ₹{(regularPrice - currentPrice).toLocaleString('en-IN')} ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Inclusive of all taxes • Free shipping on orders over ₹{storePolicy.freeShippingThreshold || 999}
            </div>

            {/* Short Selling Statement if configured */}
            {displaySellingStatement && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--ink-black)', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {displaySellingStatement}
              </div>
            )}

            {/* Promotional Offer Banner */}
            <div className="pdp-offers-banner">
              <div className="pdp-offer-item">
                <span className="pdp-offer-badge">
                  {getCopy('offerHeading', 'SPECIAL DROP')}
                </span>
                <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {getCopy('offerDescription', 'Apply coupon CALZARE100 at checkout for instant ₹100 savings on first order.')}
                </span>
              </div>
            </div>

            {/* Colorways Selection */}
            {variants.length > 1 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-black)' }}>
                    {getCopy('colorSelectorHeading', 'Select Colorway')}:{' '}
                    <span style={{ fontWeight: 800 }}>{activeVariant?.colorName}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {variants.map((v, i) => (
                    <button
                      key={v._id || i}
                      type="button"
                      onClick={() => handleColorChange(i)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: v.colorHex || '#111111',
                        border: selectedVariantIndex === i ? '3px solid var(--ink-black)' : '2px solid #e2e8f0',
                        outline: selectedVariantIndex === i ? '2px solid var(--accent-lime)' : 'none',
                        outlineOffset: '2px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                        transform: selectedVariantIndex === i ? 'scale(1.08)' : 'scale(1)',
                        padding: 0,
                      }}
                      title={v.colorName}
                      aria-label={`Choose ${v.colorName} colorway`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector Matrix */}
            <div id="size-selector-block" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-black)' }}>
                  {getCopy('sizeSelectorHeading', 'Select Size (UK/India)')}:{' '}
                  {selectedSize ? <span style={{ fontWeight: 800 }}>{selectedSize}</span> : <span style={{ color: '#ef4444' }}>Please choose</span>}
                </span>

                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-black)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  <Ruler size={14} /> {getCopy('sizeGuideButtonText', 'Size & Fit Guide')}
                </button>
              </div>

              {sizeWarning && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                  ⚠️ Please select your footwear size before adding to bag.
                </div>
              )}

              <div className="pdp-size-grid">
                {activeVariant?.sizes?.map((sz, sIdx) => {
                  const inStock = sz.stock > 0;
                  const isSelected = selectedSize === sz.size;
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        setSelectedSize(sz.size);
                        setSizeWarning(false);
                      }}
                      className={`pdp-size-btn ${isSelected ? 'is-selected' : ''}`}
                      aria-label={`${sz.size} ${inStock ? 'in stock' : 'sold out'}`}
                    >
                      {sz.size}
                      {!inStock && <span className="pdp-size-sold-tag">OUT</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Scarcity Status */}
            <div style={{ marginBottom: '24px', fontSize: '0.84rem', fontWeight: 700 }}>
              {!isSelectedSizeAvailable ? (
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={15} /> {getCopy('outOfStockMessage', 'Selected size is currently sold out.')}
                </span>
              ) : isLowStock ? (
                <span style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚡ {getCopy('lowStockMessage', `Hurry! Only ${availableStock} pairs left in stock!`)}
                </span>
              ) : (
                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} /> In Stock • Ready to Dispatch within 24 Hours
                </span>
              )}
            </div>

            {/* Quantity Selector + Primary Purchase Actions */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'stretch' }}>
              {/* Quantity Counter */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-pill)', padding: '4px 12px', background: '#ffffff' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (availableStock > 0 ? Math.min(availableStock, q + 1) : q + 1))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || !isSelectedSizeAvailable}
                className="btn-primary"
                style={{ flex: 1, padding: '16px 24px', fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.04em' }}
              >
                {addingToCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={18} /> {getCopy('addToCartText', 'ADD TO BAG')}
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`action-icon-btn ${isFavorited ? 'active' : ''}`}
                style={{
                  width: '54px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-light)',
                  background: isFavorited ? '#fef2f2' : '#ffffff',
                  color: isFavorited ? '#ef4444' : 'var(--ink-black)',
                }}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} />
              </button>
            </div>

            {/* Buy Now Direct Checkout Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={addingToCart || !isSelectedSizeAvailable}
              className="btn-outline"
              style={{
                width: '100%',
                padding: '15px 24px',
                fontSize: '0.88rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '28px',
                borderColor: 'var(--ink-black)',
              }}
            >
              {getCopy('buyNowText', 'BUY IT NOW')} <ArrowRight size={15} />
            </button>

            {/* Pincode & Delivery Checker */}
            <div className="pdp-pincode-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-black)' }}>
                <MapPin size={16} /> {getCopy('deliveryCheckHeading', 'Estimate Delivery & Serviceability')}
              </div>
              <form onSubmit={handleCheckPincode} className="pdp-pincode-input-row">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder={getCopy('deliveryCheckPlaceholder', 'Enter 6-digit Pincode')}
                  className="pdp-pincode-input"
                />
                <button type="submit" disabled={pincodeChecking} className="pdp-pincode-btn">
                  {pincodeChecking ? <Loader2 size={14} className="animate-spin" /> : getCopy('deliveryCheckButtonText', 'CHECK')}
                </button>
              </form>

              {deliveryResult && (
                <div className={`pdp-pincode-result ${deliveryResult.serviceable ? 'serviceable' : 'unserviceable'}`}>
                  {deliveryResult.serviceable ? (
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: '2px' }}>
                        ✓ {deliveryResult.message}
                      </div>
                      <div style={{ fontSize: '0.78rem' }}>
                        {deliveryResult.expressAvailable ? '⚡ Express courier dispatch enabled • ' : ''}
                        {deliveryResult.codAvailable ? 'Cash on Delivery (COD) available' : 'Prepaid orders only'}
                      </div>
                    </div>
                  ) : (
                    <div>✕ {deliveryResult.message}</div>
                  )}
                </div>
              )}
            </div>

            {/* Reassurance Trust Strip */}
            <div className="pdp-trust-strip">
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon">
                  <Truck size={16} />
                </div>
                <span>{globalDefaults?.trustBadge1 || 'Free Express Shipping Across India'}</span>
              </div>
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon">
                  <RotateCcw size={16} />
                </div>
                <span>{globalDefaults?.trustBadge2 || '3-Day Doorstep Size Exchange (₹149 Fee)'}</span>
              </div>
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon">
                  <ShieldCheck size={16} />
                </div>
                <span>{globalDefaults?.trustBadge3 || '100% Genuine CALZARE™ Footwear'}</span>
              </div>
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon">
                  <Banknote size={16} />
                </div>
                <span>{globalDefaults?.trustBadge4 || 'Cash on Delivery & Partial COD Available'}</span>
              </div>
            </div>

            {/* Deep-Dive Accordion Sections */}
            <div className="pdp-accordion-group">
              {/* 1. Description */}
              <div className="pdp-accordion-item">
                <button type="button" onClick={() => toggleAccordion('description')} className="pdp-accordion-btn">
                  <span>PRODUCT OVERVIEW & CRAFTSMANSHIP</span>
                  <ChevronDown size={18} style={{ transform: openAccordions.description ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openAccordions.description && (
                  <div className="pdp-accordion-content">
                    <p style={{ margin: '0 0 12px 0' }}>{product.description}</p>
                    {product.features?.length > 0 && (
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {product.features.map((f, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Materials, Fit & Care */}
              <div className="pdp-accordion-item">
                <button type="button" onClick={() => toggleAccordion('materials')} className="pdp-accordion-btn">
                  <span>MATERIALS, FIT GUIDANCE & CARE</span>
                  <ChevronDown size={18} style={{ transform: openAccordions.materials ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openAccordions.materials && (
                  <div className="pdp-accordion-content">
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Material: </strong>
                      {product.materialsAndCare?.material || product.material}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Fit Advice: </strong>
                      {product.materialsAndCare?.fitDescription || 'Relaxed Street Fit. True to size. Wide toe box allows comfortable toe splay.'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Care Instructions: </strong>
                      {product.materialsAndCare?.careInstructions || 'Rinse under cool water with gentle soap. Dry in a shaded area away from direct heat.'}
                    </div>
                    {product.materialsAndCare?.warranty && (
                      <div>
                        <strong>Warranty: </strong>
                        {product.materialsAndCare.warranty}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Specifications Table */}
              {product.specifications?.length > 0 && (
                <div className="pdp-accordion-item">
                  <button type="button" onClick={() => toggleAccordion('specs')} className="pdp-accordion-btn">
                    <span>TECHNICAL SPECIFICATIONS</span>
                    <ChevronDown size={18} style={{ transform: openAccordions.specs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {openAccordions.specs && (
                    <div className="pdp-accordion-content">
                      <table className="pdp-spec-table">
                        <tbody>
                          {product.specifications.map((s, idx) => (
                            <tr key={idx}>
                              <td>{s.name}</td>
                              <td>{s.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Shipping & Delivery Policy */}
              <div className="pdp-accordion-item">
                <button type="button" onClick={() => toggleAccordion('shipping')} className="pdp-accordion-btn">
                  <span>{getCopy('shippingHeading', globalDefaults?.shippingHeading || 'SHIPPING & DELIVERY')}</span>
                  <ChevronDown size={18} style={{ transform: openAccordions.shipping ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openAccordions.shipping && (
                  <div className="pdp-accordion-content">
                    <p style={{ margin: '0 0 10px 0', lineHeight: 1.6 }}>
                      {getCopy('dispatchInfo', globalDefaults?.dispatchInfo || 'Orders are generally processed within 1–2 business days after confirmation.')}
                    </p>
                    <p style={{ margin: '0 0 10px 0', lineHeight: 1.6 }}>
                      {getCopy('deliveryGuidance', globalDefaults?.deliveryGuidance || 'Estimated delivery time is 3–7 business days after dispatch across India. Delivery timelines are estimates only and are not guaranteed.')}
                    </p>
                    <p style={{ margin: '0 0 12px 0', lineHeight: 1.6 }}>
                      {getCopy('codMessage', globalDefaults?.codMessage || 'Cash on Delivery (COD) and Partial COD available for eligible PIN codes across India.')}
                    </p>
                    <Link
                      to="/shipping"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'var(--ink-black)',
                        textDecoration: 'underline',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Read Official Shipping Policy <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. Returns & Exchanges Policy */}
              <div className="pdp-accordion-item">
                <button type="button" onClick={() => toggleAccordion('returns')} className="pdp-accordion-btn">
                  <span>{getCopy('returnHeading', globalDefaults?.returnsHeading || 'REFUND, RETURN & EXCHANGE POLICY')}</span>
                  <ChevronDown size={18} style={{ transform: openAccordions.returns ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openAccordions.returns && (
                  <div className="pdp-accordion-content">
                    <p style={{ margin: '0 0 10px 0', lineHeight: 1.6 }}>
                      {getCopy('returnPolicy', globalDefaults?.returnPolicy || 'Size exchange requests must be submitted within 3 days of delivery. A disclosed exchange fee of ₹149 applies to eligible customer-requested size exchanges to help cover shipping & logistics.')}
                    </p>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      <li><strong>Size Exchanges:</strong> Must be in unused condition with original packaging, tags, and box intact.</li>
                      <li><strong>Damaged or Incorrect Items:</strong> Contact us within 48 hours of delivery with photos or an unboxing video. No fee applies when attributable to CALZARE™.</li>
                      <li><strong>Refused Deliveries / RTO:</strong> For customer-refused deliveries, ₹300 deduction or re-shipment fee applies where legally permissible.</li>
                    </ul>
                    <Link
                      to="/returns"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'var(--ink-black)',
                        textDecoration: 'underline',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Read Full Refund, Return & Exchange Policy <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* 6. Product FAQs */}
              {product.faqs?.length > 0 && (
                <div className="pdp-accordion-item">
                  <button type="button" onClick={() => toggleAccordion('faqs')} className="pdp-accordion-btn">
                    <span>{getCopy('faqHeading', 'FREQUENTLY ASKED QUESTIONS')}</span>
                    <ChevronDown size={18} style={{ transform: openAccordions.faqs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {openAccordions.faqs && (
                    <div className="pdp-accordion-content">
                      {product.faqs.map((faq, fIdx) => (
                        <div key={fIdx} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: fIdx < product.faqs.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                          <div style={{ fontWeight: 800, color: 'var(--ink-black)', marginBottom: '4px' }}>
                            {faq.question}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            {faq.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==============================================================
            KEY FEATURES GRID SECTION
            ============================================================== */}
        {product.richFeatures?.filter((f) => f.isVisible !== false).length > 0 && (
          <section className="pdp-features-section">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 16px' }}>
              <div className="badge-lime" style={{ marginBottom: '12px' }}>
                <Sparkles size={13} /> ARCHITECTURAL ENGINEERING
              </div>
              <h2 className="section-title" style={{ margin: '0 0 8px 0' }}>
                Engineered for Modern Street Culture
              </h2>
              <p className="section-subtitle">
                High-density closed-cell EVA foam compound tested for durability, wet pavement grip, and all-day walking support.
              </p>
            </div>

            <div className="pdp-features-grid">
              {product.richFeatures
                .filter((f) => f.isVisible !== false)
                .map((feature, fIdx) => (
                  <div key={fIdx} className="pdp-feature-card">
                    <div className="pdp-feature-icon">
                      {renderFeatureIcon(feature.icon)}
                    </div>
                    <h3 className="pdp-feature-title">{feature.heading}</h3>
                    <p className="pdp-feature-desc">{feature.description}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ==============================================================
            EDITORIAL STORYTELLING CHAPTERS
            ============================================================== */}
        {product.storytellingBlocks?.filter((b) => b.isEnabled !== false).map((block, bIdx) => (
          <section key={bIdx} className="pdp-story-block">
            <div className={`pdp-story-grid ${block.layout === 'image_left' ? 'image-left' : 'image-right'}`}>
              {block.layout === 'image_left' && block.imageUrl && (
                <div className="pdp-story-media-container">
                  <img src={block.imageUrl} alt={block.imageAlt || block.heading} className="pdp-story-img" loading="lazy" />
                </div>
              )}

              <div>
                {block.subheading && (
                  <div className="badge-lime" style={{ marginBottom: '12px' }}>
                    <Sparkles size={12} /> {block.subheading}
                  </div>
                )}
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--ink-black)', marginBottom: '16px' }}>
                  {block.heading}
                </h2>
                <p style={{ fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {block.body}
                </p>
              </div>

              {block.layout !== 'image_left' && block.imageUrl && (
                <div className="pdp-story-media-container">
                  <img src={block.imageUrl} alt={block.imageAlt || block.heading} className="pdp-story-img" loading="lazy" />
                </div>
              )}
            </div>
          </section>
        ))}

        {/* ==============================================================
            BRAND COMPARISON ("SEE THE DIFFERENCE") SECTION
            ============================================================== */}
        <BrandComparisonSection
          comparison={brandComparison}
          isAdmin={isStaff}
          productId={product?._id}
          productName={product?.name}
        />

        {/* ==============================================================
            VERIFIED CUSTOMER REVIEWS SECTION
            ============================================================== */}
        <section style={{ padding: '72px 0', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="badge-lime" style={{ marginBottom: '10px' }}>
                <Star size={12} /> COMMUNITY VERIFIED
              </div>
              <h2 className="section-title" style={{ margin: '0 0 6px 0' }}>
                {getCopy('reviewsHeading', 'Verified Customer Reviews')}
              </h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                Real walking feedback from CALZARE community members across India.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewFormOpen(!reviewFormOpen)}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.84rem' }}
            >
              Write a Review
            </button>
          </div>

          {/* Write Review Form */}
          {reviewFormOpen && (
            <form onSubmit={handleReviewSubmit} style={{ background: '#ffffff', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
                Share Your Experience with {product.name}
              </h3>

              {reviewSuccessMsg && (
                <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '0.88rem' }}>
                  {reviewSuccessMsg}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label className="admin-label">Your Overall Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: s })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={24} fill={s <= newReview.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="admin-label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.customerName}
                    onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="admin-label">Your Email (Private)</label>
                  <input
                    type="email"
                    required
                    value={newReview.customerEmail}
                    onChange={(e) => setNewReview({ ...newReview, customerEmail: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. rahul@example.com"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Review Title</label>
                <input
                  type="text"
                  required
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Unbelievably comfortable for daily walking"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Your Feedback / Walking Experience</label>
                <textarea
                  rows={4}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="admin-textarea"
                  placeholder="How does the foam feel? How did sizing fit your feet?"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReviewFormOpen(false)}
                  className="btn-outline"
                  style={{ padding: '10px 20px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.84rem' }}
                >
                  {reviewSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews Score Box */}
          <div className="pdp-review-score-box">
            <div>
              <div className="pdp-score-big">{(product.averageRating || 5).toFixed(1)}</div>
              <div style={{ display: 'flex', color: '#f59e0b', margin: '4px 0' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(product.averageRating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Based on {reviews.length} authentic reviews
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars] || 0;
                const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ width: '28px', fontWeight: 700 }}>{stars}★</span>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--ink-black)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ width: '28px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--ink-black)' }}>Be the first to review this silhouette.</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Share your feedback on comfort, sizing, and everyday durability.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '24px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink-black)' }}>
                      {rev.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                      {rev.comment}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--ink-black)', fontWeight: 700, paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <CheckCircle size={14} color="#16a34a" /> {rev.customerName || 'Verified Buyer'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==============================================================
            RELATED PRODUCTS RECOMMENDATION CAROUSEL
            ============================================================== */}
        {product.relatedProducts?.length > 0 && (
          <section style={{ padding: '64px 0 20px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ marginBottom: '28px' }}>
              <div className="badge-lime" style={{ marginBottom: '8px' }}>
                <Sparkles size={12} /> COMPLETE THE DROP
              </div>
              <h2 className="section-title" style={{ margin: '0 0 6px 0' }}>
                {getCopy('relatedProductsHeading', 'You Might Also Like')}
              </h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                {getCopy('relatedProductsSubtitle', 'Explore complementary silhouettes engineered with identical foam buoyancy.')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {product.relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} onQuickView={onQuickView} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div className="pdp-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
            aria-label="Close image lightbox"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>

          <img
            src={displayImages[selectedImageIndex]?.url}
            alt={displayImages[selectedImageIndex]?.alt || product.name}
            className="pdp-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizeChart={product.sizeChart}
        sizeGuideConfig={product.sizeGuideConfig}
      />

      {/* Mobile Sticky Bottom Purchase Bar */}
      {showMobileBar && (
        <div className="pdp-mobile-sticky-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={displayImages[0]?.url}
              alt={product.name}
              style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink-black)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ink-black)' }}>
                ₹{currentPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {activeVariant?.sizes?.length > 0 && (
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setSizeWarning(false);
                }}
                className="admin-select"
                style={{ padding: '8px 10px', fontSize: '0.78rem', width: 'auto', background: '#f8fafc' }}
              >
                <option value="">Size</option>
                {activeVariant.sizes.map((sz, i) => (
                  <option key={i} value={sz.size} disabled={sz.stock <= 0}>
                    {sz.size} {sz.stock <= 0 ? '(Out)' : ''}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || !isSelectedSizeAvailable}
              className="btn-primary"
              style={{ padding: '10px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {addingToCart ? <Loader2 size={14} className="animate-spin" /> : getCopy('addToCartText', 'ADD TO BAG')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
