import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { api } from '../../api/api.js';

export const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.searchProducts(searchTerm.trim());
        if (res.success && res.products) {
          setResults(res.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(16px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '64px 20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            gap: '16px',
          }}
        >
          <Search size={22} color="var(--ink-black)" />
          <input
            type="text"
            placeholder="Search footwear by silhouette, color, or collection (Press Enter for full results)..."
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--ink-black)',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
          {loading && <Loader2 size={20} className="animate-spin" color="var(--text-muted)" />}
          <button type="button" onClick={onClose} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </form>

        {/* Quick Suggestion Tags */}
        <div style={{ padding: '16px 24px', background: '#faf9f6', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>POPULAR:</span>
          {['Cloud Clog', 'Ergonomic Slider', 'Recovery Slides', 'Waterproof Foam', 'Unisex'].map((tag, idx) => (
            <button
              key={idx}
              className="badge-glass"
              style={{ cursor: 'pointer' }}
              onClick={() => setSearchTerm(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px 24px' }}>
          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((p) => {
                const img = p.defaultImages?.[0]?.url || p.variants?.[0]?.images?.[0]?.url;
                return (
                  <Link
                    key={p._id}
                    to={`/product/${p.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '10px',
                      borderRadius: '12px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f2ec')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <img
                      src={img}
                      alt={p.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        SKU: {p.sku} • {p.productType}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink-black)' }}>
                      ₹{p.baseSalePrice?.toLocaleString('en-IN')}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : searchTerm.trim().length >= 2 && !loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No footwear found matching "{searchTerm}". Try searching for "Clogs", "Sliders", or "Sandals".
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Type at least 2 characters to search across live footwear inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
