import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { Search, Loader2, Frown, Sparkles, ArrowRight } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
    if (!q.trim()) {
      setProducts([]);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const res = await api.searchProducts(q.trim());
        if (res.success && res.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Header Search Input */}
        <div style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
              marginBottom: '24px',
            }}
          >
            SEARCH ARCHIVE
          </h1>

          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by silhouette, color, clogs, sliders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 120px 16px 54px',
                borderRadius: '999px',
                border: '1px solid rgba(15,15,16,0.18)',
                fontSize: '1.05rem',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                bottom: '8px',
                padding: '0 24px',
                borderRadius: '999px',
                fontSize: '0.9rem',
              }}
            >
              Search
            </button>
          </form>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Popular:</span>
            {['Apex Clog', 'Nimbus Slide', 'Waterproof', 'Chalk White', 'Pitch Black'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm(tag);
                  setSearchParams({ q: tag });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.82rem',
                  color: 'var(--ink-black)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Overview */}
        {loading ? (
          <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
          </div>
        ) : searchParams.get('q') ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
                borderBottom: '1px solid rgba(15,15,16,0.08)',
                paddingBottom: '16px',
              }}
            >
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Found <strong>{products.length}</strong> {products.length === 1 ? 'silhouette' : 'silhouettes'} matching "
                <strong>{searchParams.get('q')}</strong>"
              </div>
            </div>

            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-xl)',
                  background: '#ffffff',
                }}
              >
                <Frown size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>No Silhouettes Found</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px' }}>
                  We couldn’t find any footwear matching your exact search. Try exploring all our drops or checking popular categories.
                </p>
                <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Browse All Footwear <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <p>Type a search term above to explore our real-time product archive.</p>
          </div>
        )}
      </div>
    </div>
  );
};
