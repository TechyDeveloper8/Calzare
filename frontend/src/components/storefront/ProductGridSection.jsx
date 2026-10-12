import React from 'react';
import { ProductCard } from '../common/ProductCard.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const ProductGridSection = ({ section, onQuickView }) => {
  const products = section.dynamicProducts || [];

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            {section.eyebrow && <span className="section-eyebrow">{section.eyebrow}</span>}
            <h2 className="section-title">{section.title || 'BESTSELLER DROP'}</h2>
            {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
          </div>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: 'var(--ink-black)',
            }}
          >
            SEE ALL SILHOUETTES <ArrowRight size={16} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Products are being populated from the catalogue.
          </div>
        )}
      </div>
    </section>
  );
};
