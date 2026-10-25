import React, { useState, useMemo, useRef } from 'react';
import { ProductCard } from '../common/ProductCard.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Grid, SlidersHorizontal, Sparkles } from 'lucide-react';

export const ProductGridSection = ({ section, onQuickView }) => {
  const allProducts = section.dynamicProducts || [];
  const railRef = useRef(null);

  // Extract unique category names from loaded products
  const categoryOptions = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (p.productType) set.add(p.productType);
      else if (p.category?.name) set.add(p.category.name);
    });
    return ['ALL SILHOUETTES', ...Array.from(set)];
  }, [allProducts]);

  const [activeCategory, setActiveCategory] = useState('ALL SILHOUETTES');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'carousel'

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'ALL SILHOUETTES') return allProducts;
    return allProducts.filter((p) => {
      const matchType = p.productType?.toLowerCase() === activeCategory.toLowerCase();
      const matchCat = p.category?.name?.toLowerCase() === activeCategory.toLowerCase();
      return matchType || matchCat;
    });
  }, [allProducts, activeCategory]);

  const handleScroll = (direction) => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ padding: '80px 0', position: 'relative' }} aria-labelledby="bestsellers-heading">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h2 id="bestsellers-heading" className="section-title">
              {section.title || 'CROWD FAVORITES & BESTSELLERS'}
            </h2>
            {section.subtitle && (
              <p className="section-subtitle" style={{ maxWidth: '580px', marginTop: '6px' }}>
                {section.subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Carousel navigation controls if carousel layout */}
            {layoutMode === 'carousel' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="action-icon-btn"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid var(--border-light)' }}
                  aria-label="Scroll products left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="action-icon-btn"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid var(--border-light)' }}
                  aria-label="Scroll products right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.88rem',
                color: 'var(--ink-black)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              See All Footwear <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {categoryOptions.length > 2 && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '14px',
              marginBottom: '28px',
              scrollbarWidth: 'none',
            }}
            role="tablist"
            aria-label="Filter products by silhouette"
          >
            {categoryOptions.map((cat) => {
              const selected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border: selected ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                    background: selected ? 'var(--ink-black)' : 'transparent',
                    color: selected ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          layoutMode === 'carousel' ? (
            <div
              ref={railRef}
              style={{
                display: 'flex',
                gap: '18px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: '16px',
                scrollbarWidth: 'none',
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  style={{
                    flex: '0 0 clamp(260px, 21vw, 320px)',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <ProductCard product={product} onQuickView={onQuickView} />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} onQuickView={onQuickView} />
              ))}
            </div>
          )
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              No silhouettes found under "{activeCategory}". Explore the full catalog below.
            </p>
            <Link to="/shop" className="btn-secondary" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Browse Complete Catalog
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
