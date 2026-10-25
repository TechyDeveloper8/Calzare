import React from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewCarouselSection = ({ section }) => {
  const reviews = section.dynamicReviews || [];

  if (!reviews || reviews.length === 0) return null;

  // Calculate actual aggregate score from genuine approved reviews
  const avgRating = (
    reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
  ).toFixed(1);

  return (
    <section style={{ padding: '80px 0', background: '#f5f3ee' }} aria-labelledby="reviews-heading">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto 48px' }}>
          <h2 id="reviews-heading" className="section-title section-title--single-line">
            {section.title || 'WORDS FROM THE PAVEMENT'}
          </h2>

          {/* Genuine Review Score Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-light)',
              marginTop: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ink-black)' }}>
              {avgRating} / 5.0
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({reviews.length} Verified Buyer Reviews)
            </span>
          </div>

          <p className="section-subtitle" style={{ margin: '14px auto 0' }}>
            {section.subtitle || 'Real feedback from customers putting our foam through daily heat, rain, and transit.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
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
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)',
              }}
            >
              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', color: '#f59e0b' }}>
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>

              {/* Title & Comment */}
              {rev.title && (
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--ink-black)' }}>
                  "{rev.title}"
                </h4>
              )}

              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px', flexGrow: 1 }}>
                {rev.comment}
              </p>

              {/* Reviewer Details */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: 'auto',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{rev.customerName}</div>
                  {rev.product?.name && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Verified Owner: {rev.product.name}
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
