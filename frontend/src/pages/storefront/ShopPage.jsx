import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/api.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { Filter, X, ChevronDown, Loader2 } from 'lucide-react';

export const ShopPage = ({ onQuickView }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Active filter states from URL search params
  const currentCategory = searchParams.get('category') || '';
  const currentAudience = searchParams.get('audience') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage = searchParams.get('page') || 1;

  // Load Categories for filter list
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && res.categories) setCategories(res.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch filtered products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          category: currentCategory,
          audience: currentAudience,
          sort: currentSort,
          size: currentSize,
          color: currentColor,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          page: currentPage,
          limit: 12,
        };
        const res = await api.getProducts(params);
        if (res.success && res.products) {
          setProducts(res.products);
          setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    currentCategory,
    currentAudience,
    currentSort,
    currentSize,
    currentColor,
    currentMinPrice,
    currentMaxPrice,
    currentPage,
  ]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    currentCategory || currentAudience || currentSize || currentColor || currentMinPrice || currentMaxPrice;

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Page Heading & Filter Trigger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', margin: 0 }}>FOOTWEAR COLLECTION</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Filter Toggle Button */}
            <button
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.82rem' }}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <Filter size={16} /> FILTERS {hasActiveFilters && '• ACTIVE'}
            </button>

            {/* Sort Select */}
            <div style={{ position: 'relative' }}>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                style={{
                  appearance: 'none',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  padding: '11px 36px 11px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--ink-black)',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">SORT: FEATURED</option>
                <option value="bestselling">SORT: BESTSELLING</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
                <option value="newest">NEWEST RELEASES</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Quick Audience Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['All', 'Men', 'Women', 'Kids', 'Unisex'].map((aud) => {
            const isSelected = (!currentAudience && aud === 'All') || currentAudience === aud;
            return (
              <button
                key={aud}
                className={isSelected ? 'badge-black' : 'badge-glass'}
                style={{ cursor: 'pointer', padding: '8px 18px', fontSize: '0.8rem' }}
                onClick={() => updateFilter('audience', aud === 'All' ? '' : aud)}
              >
                {aud}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={onQuickView} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '64px' }}>
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCur = pageNum === Number(pagination.page);
                  return (
                    <button
                      key={pageNum}
                      className={isCur ? 'btn-primary' : 'btn-secondary'}
                      style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%' }}
                      onClick={() => updateFilter('page', pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: '12px' }}>NO FOOTWEAR FOUND</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              No products match your selected combination of filters.
            </p>
            <button className="btn-primary" onClick={clearAllFilters}>
              RESET ALL FILTERS
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 250, backdropFilter: 'blur(8px)' }}
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              background: '#ffffff',
              padding: '32px 24px',
              overflowY: 'auto',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>REFINE CATALOGUE</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} style={{ padding: '6px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>
                Category
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    textAlign: 'left',
                    fontWeight: !currentCategory ? 800 : 500,
                    color: !currentCategory ? 'var(--ink-black)' : 'var(--text-secondary)',
                  }}
                  onClick={() => updateFilter('category', '')}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    style={{
                      textAlign: 'left',
                      fontWeight: currentCategory === c.slug ? 800 : 500,
                      color: currentCategory === c.slug ? 'var(--ink-black)' : 'var(--text-secondary)',
                    }}
                    onClick={() => updateFilter('category', c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>
                Size (UK/India)
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(currentAudience === 'Kids'
                  ? ['UK 10C', 'UK 11C', 'UK 12C', 'UK 13C', 'UK 1', 'UK 2', 'UK 3']
                  : ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
                ).map((sz) => {
                  const isSel = currentSize === sz;
                  return (
                    <button
                      key={sz}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: isSel ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                        background: isSel ? 'var(--ink-black)' : '#ffffff',
                        color: isSel ? '#ffffff' : 'var(--ink-black)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                      }}
                      onClick={() => updateFilter('size', isSel ? '' : sz)}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>
                Price Range
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={currentMinPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  style={{ width: '50%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={currentMaxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  style={{ width: '50%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                style={{ flexGrow: 1, padding: '12px' }}
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                APPLY FILTERS
              </button>
              {hasActiveFilters && (
                <button
                  className="btn-secondary"
                  style={{ padding: '12px' }}
                  onClick={clearAllFilters}
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
