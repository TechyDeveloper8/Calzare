import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

export const HomePage = ({ onQuickView }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await api.getHomepage();
        if (res.success && res.sections) {
          setSections(res.sections);
        }
      } catch (err) {
        console.error('Failed to load dynamic homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => {
        if (!section.isEnabled) return null;

        switch (section.sectionType) {
          case 'hero':
            return <HeroBannerSection key={section._id} section={section} />;
          case 'ticker':
            return <TrustTickerSection key={section._id} section={section} />;
          case 'bestsellers':
          case 'product_grid':
            return <ProductGridSection key={section._id} section={section} onQuickView={onQuickView} />;
          case 'audience_cards':
            return <AudienceSection key={section._id} section={section} />;
          case 'affordable_store':
            return <AffordableStoreSection key={section._id} section={section} onQuickView={onQuickView} />;
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
    </div>
  );
};
