import React from 'react';
import { ProductCard } from '../common/ProductCard.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const AffordableStoreSection = ({ section, onQuickView }) => {
  const products = section.dynamicProducts || [];
  const startingPrice = section.actualStartingPrice || 699;

  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <div className="affordable-store-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="badge-lime" style={{ marginBottom: '12px' }}>
                <Sparkles size={13} /> STARTING AT ONLY ₹{startingPrice}
              </div>
              <h2 className="section-title">{section.title || 'THE UNDER ₹999 STORE'}</h2>
              <p className="section-subtitle">
                {section.subtitle ||
                  'High performance closed-cell foam shouldn’t cost a week’s wage. Premium daily comfort at honest prices.'}
              </p>
            </div>
            <Link
              to="/collections/under-999-store"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.85rem' }}
            >
              VIEW ALL UNDER ₹999 <ArrowRight size={16} />
            </Link>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
