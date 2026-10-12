import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export const ReviewCarouselSection = ({ section }) => {
  const reviews = section.dynamicReviews || [];

  if (!reviews.length) return null;

  return (
    <section style={{ padding: '80px 0', background: '#f5f3ee' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          {section.eyebrow && <span className="section-eyebrow">{section.eyebrow}</span>}
          <h2 className="section-title">{section.title || 'WORDS FROM THE PAVEMENT'}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {section.subtitle || 'Honest reviews from customers walking in real rain, heat, and city transit.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', color: '#f59e0b' }}>
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              {/* Title & Comment */}
              {rev.title && (
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '8px', color: 'var(--ink-black)' }}>
                  "{rev.title}"
                </h4>
              )}
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px', flexGrow: 1 }}>
                {rev.comment}
              </p>

              {/* Reviewer Details */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{rev.customerName}</div>
                  {rev.product?.name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Purchased: {rev.product.name}
                    </div>
                  )}
                </div>

                {rev.verifiedPurchase && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#166534',
                      background: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    <CheckCircle size={12} /> Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
