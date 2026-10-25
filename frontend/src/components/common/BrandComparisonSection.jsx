import React from 'react';
import { Sparkles, Settings, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * BrandComparisonSection
 * Renders the "SEE THE DIFFERENCE" Brand Comparison graphic on the Product Detail Page.
 * Inspired by the SolaWorld reference battlecard asset.
 *
 * Requirements:
 * - Natural content width and complete image preservation (no cropping).
 * - Exact aspect ratio preservation without distortion or stretching.
 * - Responsive picture element for desktop & mobile assets.
 * - Lazy loading below the fold.
 * - Meaningful alt text.
 * - Admin draft preview badge & admin configuration notice when unconfigured.
 * - Completely hidden for visitors if unconfigured or unpublished.
 */
export const BrandComparisonSection = ({
  comparison,
  isAdmin = false,
  productId = '',
  productName = '',
}) => {
  // If no comparison provided or not visible
  if (!comparison || (!comparison.isVisible && !isAdmin)) {
    return null;
  }

  const {
    isVisible,
    isDraft,
    heading = 'SEE THE DIFFERENCE',
    subheading = 'How CALZARE monolithic closed-cell foam compares to standard footwear',
    desktopMediaUrl = '',
    mobileMediaUrl = '',
    altText = 'Brand comparison',
  } = comparison;

  // Admin-only configuration notice when section is not visible to visitors
  if (!isVisible && isAdmin) {
    return (
      <section className="pdp-brand-comparison pdp-brand-comparison--admin-only" aria-label="Brand comparison admin notice">
        <div className="pdp-brand-comparison__admin-notice">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--ink-black)', color: 'var(--accent-lime)', padding: '8px', borderRadius: '8px' }}>
              <Settings size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--ink-black)' }}>
                Admin Notice: Brand Comparison Section is Hidden
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {comparison.mode === 'disabled'
                  ? 'Explicitly disabled at product level.'
                  : !desktopMediaUrl
                  ? 'No comparison image uploaded yet (Global or Product).'
                  : 'Section is currently turned off or saved as draft.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {productId && (
              <Link
                to={`/admin/products/edit/${productId}`}
                className="admin-btn admin-btn-sm"
                style={{
                  background: 'var(--ink-black)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Settings size={13} /> Edit Product
              </Link>
            )}
            <Link
              to="/admin/settings"
              className="admin-btn admin-btn-sm"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                color: 'var(--ink-black)',
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Global Settings
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // If no media URL exists at all, do not render broken image
  if (!desktopMediaUrl && !mobileMediaUrl) {
    return null;
  }

  return (
    <section
      className="pdp-brand-comparison"
      aria-label={heading || 'Brand Comparison'}
      id="brand-comparison-section"
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header Block */}
        <div className="pdp-brand-comparison__header">
          <div className="pdp-brand-comparison__badge">
            <Sparkles size={13} /> CALZARE LABS
          </div>

          <h2 className="pdp-brand-comparison__title">
            {heading}
          </h2>

          {subheading && (
            <p className="pdp-brand-comparison__subtitle">
              {subheading}
            </p>
          )}
        </div>

        {/* Media Container with Complete Aspect Ratio Preservation */}
        <div className="pdp-brand-comparison__media-wrapper">
          {/* Admin Draft Indicator */}
          {isAdmin && isDraft && (
            <div className="pdp-brand-comparison__draft-badge">
              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Admin Preview — Draft (Unpublished)
            </div>
          )}

          <picture className="pdp-brand-comparison__picture">
            {mobileMediaUrl && (
              <source
                media="(max-width: 768px)"
                srcSet={mobileMediaUrl}
              />
            )}
            <img
              src={desktopMediaUrl || mobileMediaUrl}
              alt={altText || `Brand comparison for ${productName || 'CALZARE Footwear'}`}
              loading="lazy"
              decoding="async"
              className="pdp-brand-comparison__image"
              width={2000}
              height={1218}
            />
          </picture>
        </div>
      </div>
    </section>
  );
};
