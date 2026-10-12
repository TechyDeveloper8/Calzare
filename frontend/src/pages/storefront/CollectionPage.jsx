import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { Loader2 } from 'lucide-react';

export const CollectionPage = ({ preset, onQuickView }) => {
  const params = useParams();
  const slug = preset || params.slug;
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        if (preset === 'men') {
          setCollection({
            name: "MEN'S FOOTWEAR EDIT",
            eyebrow: 'ENGINEERED BUOYANCY // MEN',
            description:
              'Heavy-duty arch contoured clogs, platform slides, and waterproof trail sandals built for masculine proportions and all-day pavement movement.',
          });
          const res = await api.getProducts({ audience: 'Men', limit: 24 });
          setProducts(res.products || []);
        } else if (preset === 'women') {
          setCollection({
            name: "WOMEN'S FOOTWEAR EDIT",
            eyebrow: 'SCULPTED SILHOUETTES // WOMEN',
            description:
              'Ultra-lightweight platform mules, pastel clogs, and ergonomic rebound slides crafted for effortless everyday street style.',
          });
          const res = await api.getProducts({ audience: 'Women', limit: 24 });
          setProducts(res.products || []);
        } else if (preset === 'kids') {
          setCollection({
            name: "KIDS' FOOTWEAR COLLECTION",
            eyebrow: 'PLAYGROUND BUOYANCY // MINI SIZES',
            description:
              'Featherweight, 100% waterproof closed-cell EVA foam clogs and slides with pivoting safety heel straps. Engineered for spill-proof puddle stomping and all-day recess comfort.',
          });
          const res = await api.getProducts({ audience: 'Kids', limit: 24 });
          setProducts(res.products || []);
        } else if (preset === 'unisex') {
          setCollection({
            name: 'UNISEX ARCHITECTURAL SERIES',
            eyebrow: 'UNIVERSAL PROPORTIONS // UNISEX',
            description:
              'Pure minimalist geometry and dual-density comfort designed with zero gender boundaries. For everywhere, everyone.',
          });
          const res = await api.getProducts({ audience: 'Unisex', limit: 24 });
          setProducts(res.products || []);
        } else if (preset === 'new-arrivals') {
          setCollection({
            name: 'NEW ARRIVALS // SS26 RELEASE',
            eyebrow: 'LATEST RELEASES // FRESH SILHOUETTES',
            description:
              'Recently engineered architectural foam footwear, seasonal colorways, and limited edition silhouettes fresh from production molds.',
          });
          const res = await api.getProducts({ sort: 'newest', limit: 24 });
          setProducts(res.products || []);
        } else if (slug) {
          const res = await api.getCollectionBySlug(slug);
          if (res.success && res.collection) {
            setCollection({
              name: res.collection.name,
              eyebrow: 'CURATED COLLECTION',
              description: res.collection.description,
            });
            setProducts(res.products || []);
          }
        }
      } catch (err) {
        console.error('Failed to load collection:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [preset, slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Collection Not Found</h2>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Hero Collection Header */}
      <div
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          background: 'var(--canvas-stone)',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '48px',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <span className="section-eyebrow">CURATED COLLECTION // {products.length} STYLES</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', marginBottom: '16px' }}>{collection.name}</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>{collection.description}</p>
          </div>
        </div>
      </div>

      <div className="container">
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onQuickView={onQuickView} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products currently in this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
};
