import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/api.js';
import { HeroBannerSection } from '../../components/storefront/HeroBannerSection.jsx';
import { TrustTickerSection } from '../../components/storefront/TrustTickerSection.jsx';
import { ProductGridSection } from '../../components/storefront/ProductGridSection.jsx';
import { AudienceSection } from '../../components/storefront/AudienceSection.jsx';
import { AffordableStoreSection } from '../../components/storefront/AffordableStoreSection.jsx';
import { StorytellingSection } from '../../components/storefront/StorytellingSection.jsx';
import { CategoryDiscoverySection } from '../../components/storefront/CategoryDiscoverySection.jsx';
import { ReviewCarouselSection } from '../../components/storefront/ReviewCarouselSection.jsx';
import { BenefitsSection } from '../../components/storefront/BenefitsSection.jsx';
import { NewsletterSection } from '../../components/storefront/NewsletterSection.jsx';
import { QuickViewModal } from '../../components/common/QuickViewModal.jsx';
import { Loader2, RefreshCw } from 'lucide-react';

export const HomePage = ({ onQuickView: propOnQuickView }) => {
  const outletCtx = useOutletContext() || {};
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [internalQuickViewProduct, setInternalQuickViewProduct] = useState(null);

  const handleQuickView = (p) => {
    if (propOnQuickView) propOnQuickView(p);
    else if (outletCtx?.onQuickView) outletCtx.onQuickView(p);
    else setInternalQuickViewProduct(p);
  };

  const fetchHomepage = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getHomepage();
      if (res.success && res.sections) {
        setSections(res.sections);
      } else {
        throw new Error(res.message || 'Failed to load homepage sections');
      }
    } catch (err) {
      console.error('Failed to load dynamic homepage:', err);
      setError(err.message || 'Failed to load store content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set descriptive SEO page title
    document.title = 'CALZARE — High-Performance Architectural Foam Footwear & Clogs';

    // Set meta description tag if present
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Discover CALZARE: Dual-density waterproof closed-cell EVA foam clogs, slides, and sandals engineered for maximum cushioning, arch support, and bold street expression.'
      );
    }

    fetchHomepage();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}
      >
        <Loader2 size={38} className="animate-spin" color="var(--ink-black)" />
        <span style={{ fontSize: '0.84rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
          LOADING CALZARE STOREFRONT...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Storefront Currently Updating</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>{error}</p>
          <button onClick={fetchHomepage} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'OnlineStore',
            name: 'CALZARE Footwear',
            description:
              'High-performance closed-cell waterproof EVA foam footwear designed for modern street culture and all-day walking support.',
            url: window.location.origin,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Dynamic Ordered CMS Sections */}
      {sections.map((section) => {
        if (!section.isEnabled) return null;

        switch (section.sectionType) {
          case 'hero':
            return <HeroBannerSection key={section._id} section={section} />;
          case 'ticker':
            return <TrustTickerSection key={section._id} section={section} />;
          case 'bestsellers':
          case 'product_grid':
            return (
              <ProductGridSection
                key={section._id}
                section={section}
                onQuickView={handleQuickView}
              />
            );
          case 'audience_cards':
          case 'shop_split':
            return <AudienceSection key={section._id} section={section} />;
          case 'affordable_store':
            return (
              <AffordableStoreSection
                key={section._id}
                section={section}
                onQuickView={handleQuickView}
              />
            );
          case 'storytelling':
            return <StorytellingSection key={section._id} section={section} />;
          case 'category_discovery':
            return <CategoryDiscoverySection key={section._id} section={section} />;
          case 'reviews':
            return <ReviewCarouselSection key={section._id} section={section} />;
          case 'benefits':
            return <BenefitsSection key={section._id} section={section} />;
          case 'newsletter':
            return <NewsletterSection key={section._id} section={section} />;
          default:
            return null;
        }
      })}

      {/* Fallback Internal Quick View Modal */}
      <QuickViewModal
        product={internalQuickViewProduct}
        isOpen={Boolean(internalQuickViewProduct)}
        onClose={() => setInternalQuickViewProduct(null)}
      />
    </div>
  );
};
