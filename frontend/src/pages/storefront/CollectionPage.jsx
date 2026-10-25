import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  Columns2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Check,
} from 'lucide-react';

export const CollectionPage = ({ preset }) => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext();
  const onQuickView = outletContext?.onQuickView;

  const activeSlug = (preset || params.slug || 'men').toLowerCase();

  // Core Data States
  const [collection, setCollection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // UI Interactive States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [desktopColumns, setDesktopColumns] = useState(4); // 4 or 2 columns

  // Filter States from URL query parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 1. Fetch Collection Metadata from CMS
  useEffect(() => {
    let isMounted = true;
    const fetchCollectionMetadata = async () => {
      try {
        const res = await api.getCollectionBySlug(activeSlug);
        if (isMounted && res.success && res.collection) {
          setCollection(res.collection);
          if (res.categories?.length) {
            setCategories(res.categories);
          }
        }
      } catch (err) {
        console.warn('Collection metadata fallback used:', err.message);
        if (isMounted) {
          // Robust fallback if collection metadata endpoint returns non-200
          const title =
            activeSlug === 'men'
              ? "MEN'S FOOTWEAR EDIT"
              : activeSlug === 'women'
              ? "WOMEN'S FOOTWEAR EDIT"
              : activeSlug === 'kids'
              ? "KIDS' FOOTWEAR COLLECTION"
              : activeSlug === 'unisex'
              ? 'UNISEX ARCHITECTURAL SERIES'
              : activeSlug.toUpperCase();

          setCollection({
            name: title,
            slug: activeSlug,
            description: 'Everyday comfort. Zero ordinary energy.',
            hero: {
              label: activeSlug === 'men' ? "THE MEN'S EDIT" : 'COLLECTION',
              heading: 'BUILT TO STAND OUT.',
              supportingText: 'Everyday comfort. Zero ordinary energy.',
              desktopBannerUrl:
                activeSlug === 'men'
                  ? '/images/split/men-collection-image.jpg'
                  : '/images/split/women-collection-image.jpg',
              mobileBannerUrl: '',
              imagePosition: 'center center',
              background: 'editorial_minimal',
              ctaText: 'EXPLORE DROP',
              ctaLink: '#collection-grid',
              isVisible: true,
            },
            isPublished: true,
          });
        }
      }
    };

    fetchCollectionMetadata();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  // 2. Fetch Catalog Categories for Shortcuts Bar
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await api.getCategories();
        if (isMounted && res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch Filtered Products from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = {
          sort: currentSort,
          page: currentPage,
          limit: 12,
        };

        // Audience Resolution
        if (activeSlug === 'men') {
          queryParams.audience = 'Men';
        } else if (activeSlug === 'women') {
          queryParams.audience = 'Women';
        } else if (activeSlug === 'kids') {
          queryParams.audience = 'Kids';
        } else if (activeSlug === 'unisex') {
          queryParams.audience = 'Unisex';
        } else {
          queryParams.collection = activeSlug;
        }

        if (currentCategory && currentCategory !== 'all') {
          queryParams.category = currentCategory;
        }
        if (currentSize) queryParams.size = currentSize;
        if (currentColor) queryParams.color = currentColor;
        if (currentMinPrice) queryParams.minPrice = currentMinPrice;
        if (currentMaxPrice) queryParams.maxPrice = currentMaxPrice;
        if (currentAvailability) queryParams.availability = currentAvailability;

        const res = await api.getProducts(queryParams);
        if (isMounted && res.success) {
          setProducts(res.products || []);
          setPagination(res.pagination || { page: 1, pages: 1, total: res.products?.length || 0 });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load products');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFilteredProducts();
    return () => {
      isMounted = false;
    };
  }, [
    activeSlug,
    currentCategory,
    currentSort,
    currentSize,
    currentColor,
    currentMinPrice,
    currentMaxPrice,
    currentAvailability,
    currentPage,
  ]);

  // Update URL Search Parameters
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'All') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    const nextParams = new URLSearchParams();
    if (currentSort && currentSort !== 'featured') {
      nextParams.set('sort', currentSort);
    }
    setSearchParams(nextParams);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentCategory && currentCategory !== 'all') count++;
    if (currentSize) count++;
    if (currentColor) count++;
    if (currentMinPrice || currentMaxPrice) count++;
    if (currentAvailability === 'in_stock') count++;
    return count;
  }, [currentCategory, currentSize, currentColor, currentMinPrice, currentMaxPrice, currentAvailability]);

  // Known catalog filter options derived from real inventory
  const availableSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  const availableColors = [
    { name: 'Pitch Black', hex: '#18181A' },
    { name: 'Oat Beige', hex: '#E5DFC5' },
    { name: 'Sage Moss', hex: '#7A8B78' },
    { name: 'Chalk White', hex: '#F4F4F4' },
    { name: 'Desert Clay', hex: '#C27D60' },
    { name: 'Espresso Tan', hex: '#4A3525' },
    { name: 'Electric Lime', hex: '#D8FF00' },
  ];

  // Price presets
  const applyPricePreset = (min, max) => {
    const nextParams = new URLSearchParams(searchParams);
    if (min) nextParams.set('minPrice', min);
    else nextParams.delete('minPrice');
    if (max) nextParams.set('maxPrice', max);
    else nextParams.delete('maxPrice');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // SEO Page Title synchronization
  useEffect(() => {
    if (collection?.name) {
      document.title = `${collection.name} | CALZARE Storefront`;
    }
  }, [collection]);

  const heroConfig = collection?.hero || {};
  const showHero = heroConfig.isVisible !== false;

  return (
    <div className="collection-page" id="collection-page-root">
      {/* ── 1. SolaWorld Editorial Collection Hero ────────────────────────── */}
      {showHero ? (
        <section
          className={`collection-hero collection-hero--editorial ${
            heroConfig.background === 'dark_canvas' ? 'collection-hero--dark' : ''
          }`}
          aria-label="Collection Editorial Hero"
        >
          <div className="container">
            <div className="collection-hero__inner">
              <div className="collection-hero__content">
                {heroConfig.label && (
                  <span className="collection-hero__eyebrow">
                    <Sparkles size={12} color="#0f172a" />
                    {heroConfig.label}
                  </span>
                )}
                <h1 className="collection-hero__headline">
                  {heroConfig.heading || collection?.name || "MEN'S FOOTWEAR EDIT"}
                </h1>
                <p className="collection-hero__desc">
                  {heroConfig.supportingText ||
                    collection?.description ||
                    'Everyday comfort. Zero ordinary energy.'}
                </p>

                <a
                  href={heroConfig.ctaLink || '#collection-grid'}
                  className="collection-hero__cta"
                  onClick={(e) => {
                    if (heroConfig.ctaLink?.startsWith('#')) {
                      e.preventDefault();
                      const target = document.querySelector(heroConfig.ctaLink);
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {heroConfig.ctaText || 'EXPLORE DROP'}
                  <ArrowRight size={15} />
                </a>
              </div>

              {heroConfig.desktopBannerUrl && (
                <div className="collection-hero__media">
                  <picture>
                    {heroConfig.mobileBannerUrl && (
                      <source media="(max-width: 767px)" srcSet={heroConfig.mobileBannerUrl} />
                    )}
                    <img
                      src={heroConfig.desktopBannerUrl}
                      alt={heroConfig.heading || 'Men Collection Editorial Campaign'}
                      className="collection-hero__img"
                      style={{ objectPosition: heroConfig.imagePosition || 'center center' }}
                    />
                  </picture>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="collection-hero collection-hero--minimal">
          <div className="container">
            <h1 className="collection-hero__headline">{collection?.name || "MEN'S FOOTWEAR"}</h1>
            <p className="collection-hero__desc">{collection?.description}</p>
          </div>
        </section>
      )}

      <div className="container" id="collection-grid">
        {/* ── 2. Category Shortcuts Bar ──────────────────────────────────── */}
        <div className="category-shortcuts-wrap" aria-label="Footwear Category Shortcuts">
          <div className="category-shortcuts-list" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!currentCategory || currentCategory === 'all'}
              className={`category-shortcut-pill ${!currentCategory || currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => updateFilter('category', '')}
            >
              All Footwear
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id || cat.slug}
                type="button"
                role="tab"
                aria-selected={currentCategory === cat.slug}
                className={`category-shortcut-pill ${currentCategory === cat.slug ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Filter & Sorting Toolbar ─────────────────────────────────── */}
        <div className="collection-toolbar" role="region" aria-label="Collection Toolbar">
          <div className="collection-toolbar__left">
            <button
              type="button"
              className="toolbar-filter-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-label="Open Filter Controls Drawer"
            >
              <SlidersHorizontal size={14} />
              Filter
              {activeFiltersCount > 0 && (
                <span className="toolbar-filter-badge">{activeFiltersCount}</span>
              )}
            </button>

            <span className="toolbar-count">
              {loading
                ? 'Updating styles...'
                : `There are ${pagination.total} results in total`}
            </span>
          </div>

          <div className="collection-toolbar__right">
            {/* Desktop Grid Switcher */}
            <div className="toolbar-view-toggle d-none d-md-flex" aria-label="Grid Column Switcher">
              <button
                type="button"
                className={`toolbar-view-btn ${desktopColumns === 4 ? 'active' : ''}`}
                onClick={() => setDesktopColumns(4)}
                title="4 Columns Grid"
                aria-label="4 columns"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                type="button"
                className={`toolbar-view-btn ${desktopColumns === 2 ? 'active' : ''}`}
                onClick={() => setDesktopColumns(2)}
                title="2 Columns Editorial Grid"
                aria-label="2 columns"
              >
                <Columns2 size={16} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="toolbar-sort-select"
              aria-label="Sort products by"
            >
              <option value="featured">Featured Edit</option>
              <option value="bestselling">Bestselling First</option>
              <option value="newest">Newest Drops</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* ── 4. Active Filters Chips ─────────────────────────────────────── */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-row" aria-label="Currently Applied Filters">
            {currentCategory && (
              <span className="filter-chip">
                Category:{' '}
                {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button
                  type="button"
                  className="filter-chip-remove"
                  onClick={() => updateFilter('category', '')}
                  aria-label="Remove category filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {currentSize && (
              <span className="filter-chip">
                Size: {currentSize}
                <button
                  type="button"
                  className="filter-chip-remove"
                  onClick={() => updateFilter('size', '')}
                  aria-label="Remove size filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {currentColor && (
              <span className="filter-chip">
                Color: {currentColor}
                <button
                  type="button"
                  className="filter-chip-remove"
                  onClick={() => updateFilter('color', '')}
                  aria-label="Remove color filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="filter-chip">
                Price: ₹{currentMinPrice || '0'} – ₹{currentMaxPrice || '∞'}
                <button
                  type="button"
                  className="filter-chip-remove"
                  onClick={() => applyPricePreset('', '')}
                  aria-label="Remove price filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {currentAvailability === 'in_stock' && (
              <span className="filter-chip">
                In Stock Only
                <button
                  type="button"
                  className="filter-chip-remove"
                  onClick={() => updateFilter('availability', '')}
                  aria-label="Remove in-stock filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            <button
              type="button"
              className="filter-clear-all"
              onClick={clearAllFilters}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── 5. Product Grid & States ───────────────────────────────────── */}
        {loading ? (
          <div
            className={`product-grid ${desktopColumns === 2 ? 'product-grid--2col' : ''}`}
            aria-busy="true"
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  minHeight: '380px',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="collection-empty">
            <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 className="collection-empty__title">Failed to Load Products</h3>
            <p className="collection-empty__desc">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="collection-empty__btn"
            >
              <RotateCcw size={14} /> Retry Request
            </button>
          </div>
        ) : products.length > 0 ? (
          <>
            <div
              className={`product-grid ${desktopColumns === 2 ? 'product-grid--2col' : ''}`}
            >
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={onQuickView} />
              ))}
            </div>

            {/* Pagination / Load More if multiple pages */}
            {pagination.pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '48px',
                }}
              >
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => updateFilter('page', String(pNum))}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: currentPage === pNum ? '#0f172a' : '#e2e8f0',
                        background: currentPage === pNum ? '#0f172a' : '#ffffff',
                        color: currentPage === pNum ? '#ffffff' : '#0f172a',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="collection-empty">
            <SlidersHorizontal size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 className="collection-empty__title">No Matching Styles Found</h3>
            <p className="collection-empty__desc">
              No products match your currently active filter combination. Reset your filters or
              adjust size and price settings to explore the complete catalog.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="collection-empty__btn"
            >
              <RotateCcw size={14} /> Reset All Filters
            </button>
          </div>
        )}

        {/* ── 6. Optional Editorial Story Banner ──────────────────────────── */}
        {collection?.editorialBanner?.isEnabled && (
          <section className="collection-editorial-banner" aria-label="Brand Story Campaign">
            <div className="collection-editorial-banner__inner">
              <div className="collection-editorial-banner__content">
                {collection.editorialBanner.eyebrow && (
                  <div className="collection-editorial-banner__eyebrow">
                    {collection.editorialBanner.eyebrow}
                  </div>
                )}
                <h2 className="collection-editorial-banner__heading">
                  {collection.editorialBanner.heading || 'BUILT FOR THE STREET TRENCHES'}
                </h2>
                <p className="collection-editorial-banner__text">
                  {collection.editorialBanner.bodyText ||
                    'Monolithic closed-cell EVA foam engineered with dual-density arch contouring. Zero break-in, infinite durability.'}
                </p>
                {collection.editorialBanner.ctaText && (
                  <Link
                    to={collection.editorialBanner.ctaLink || '/about'}
                    className="handoff-btn"
                    style={{
                      background: '#d8ff00',
                      color: '#0f172a',
                      padding: '12px 28px',
                      borderRadius: '999px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                    }}
                  >
                    {collection.editorialBanner.ctaText}
                  </Link>
                )}
              </div>
              {collection.editorialBanner.imageUrl && (
                <div className="collection-editorial-banner__media">
                  <img
                    src={collection.editorialBanner.imageUrl}
                    alt={collection.editorialBanner.heading || 'Brand story'}
                    className="collection-editorial-banner__img"
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── 7. Slide-over Filter Drawer ─────────────────────────────────── */}
      {isFilterDrawerOpen && (
        <div
          className="filter-drawer-backdrop"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            className="filter-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filter Collection Options"
          >
            <div className="filter-drawer__header">
              <h3 className="filter-drawer__title">Filter & Refine</h3>
              <button
                type="button"
                className="filter-drawer__close"
                onClick={() => setIsFilterDrawerOpen(false)}
                aria-label="Close Filter Drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="filter-drawer__body">
              {/* Filter Group: Category / Silhouette */}
              <div className="filter-group">
                <div className="filter-group__heading">Silhouette / Category</div>
                <div className="filter-options-grid">
                  <button
                    type="button"
                    className={`filter-size-btn ${!currentCategory || currentCategory === 'all' ? 'active' : ''}`}
                    onClick={() => updateFilter('category', '')}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id || c.slug}
                      type="button"
                      className={`filter-size-btn ${currentCategory === c.slug ? 'active' : ''}`}
                      onClick={() => updateFilter('category', c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group: Size */}
              <div className="filter-group">
                <div className="filter-group__heading">Size (UK / India)</div>
                <div className="filter-options-grid">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`filter-size-btn ${currentSize === sz ? 'active' : ''}`}
                      onClick={() => updateFilter('size', currentSize === sz ? '' : sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group: Color */}
              <div className="filter-group">
                <div className="filter-group__heading">Colorway</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableColors.map((clr) => (
                    <button
                      key={clr.name}
                      type="button"
                      className={`filter-color-chip ${currentColor === clr.name ? 'active' : ''}`}
                      onClick={() => updateFilter('color', currentColor === clr.name ? '' : clr.name)}
                    >
                      <span
                        className="filter-color-dot"
                        style={{ backgroundColor: clr.hex }}
                      />
                      {clr.name}
                      {currentColor === clr.name && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group: Price Range */}
              <div className="filter-group">
                <div className="filter-group__heading">Price Range (₹)</div>
                <div className="filter-price-inputs">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={currentMinPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="filter-price-input"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={currentMaxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="filter-price-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => applyPricePreset('', '999')}
                    className="category-shortcut-pill"
                    style={{ fontSize: '0.74rem', padding: '5px 12px' }}
                  >
                    Under ₹999
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPricePreset('1000', '1499')}
                    className="category-shortcut-pill"
                    style={{ fontSize: '0.74rem', padding: '5px 12px' }}
                  >
                    ₹1,000 – ₹1,499
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPricePreset('1500', '')}
                    className="category-shortcut-pill"
                    style={{ fontSize: '0.74rem', padding: '5px 12px' }}
                  >
                    ₹1,500+
                  </button>
                </div>
              </div>

              {/* Filter Group: Availability */}
              <div className="filter-group">
                <div className="filter-group__heading">Availability</div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#0f172a',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={currentAvailability === 'in_stock'}
                    onChange={(e) => updateFilter('availability', e.target.checked ? 'in_stock' : '')}
                    style={{ width: '16px', height: '16px', accentColor: '#0f172a' }}
                  />
                  In Stock Only
                </label>
              </div>
            </div>

            <div className="filter-drawer__footer">
              <button
                type="button"
                className="filter-drawer__reset"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
              <button
                type="button"
                className="filter-drawer__apply"
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Apply Filters ({pagination.total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
