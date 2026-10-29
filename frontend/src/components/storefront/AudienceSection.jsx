import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_PANEL_IMAGES = {
  women: '/images/split/women-collection-image.jpg',
  men: '/images/split/men-collection-image.jpg',
  kids: '/images/split/kids-collection-image.jpg',
  unisex: '/images/split/unisex-collection-image.jpg',
};

const getPanelImage = (panel) => {
  if (panel?.imageUrl && typeof panel.imageUrl === 'string' && panel.imageUrl.trim() !== '') {
    return panel.imageUrl.trim();
  }
  const idStr = `${panel?.id || ''} ${panel?.title || ''} ${panel?.link || ''}`.toLowerCase();
  if (idStr.includes('women')) return DEFAULT_PANEL_IMAGES.women;
  if (idStr.includes('men')) return DEFAULT_PANEL_IMAGES.men;
  if (idStr.includes('kid')) return DEFAULT_PANEL_IMAGES.kids;
  if (idStr.includes('unisex')) return DEFAULT_PANEL_IMAGES.unisex;
  return DEFAULT_PANEL_IMAGES.women;
};

export const AudienceSection = ({ section, isPreview = false }) => {
  const config = section?.config || {};
  
  // Support both categoryPanels and audienceCards keys for complete CMS compatibility
  const sourcePanels = config.categoryPanels?.length
    ? config.categoryPanels
    : config.audienceCards?.length
    ? config.audienceCards
    : [
        {
          id: 'panel_women',
          title: 'Women',
          text: 'No laces, no rush — comfort that clocks off exactly when you do.',
          tagline: 'No laces, no rush — comfort that clocks off exactly when you do.',
          ctaLabel: 'Shop Women',
          link: '/collections/women',
          imageUrl: '/images/split/women-collection-image.jpg',
          altText: 'Shop Women',
          order: 0,
          isEnabled: true,
          isPublished: true,
          objectPosition: 'center bottom',
          textAlign: 'left',
        },
        {
          id: 'panel_men',
          title: 'Men',
          text: 'Stairs, streets, wherever next.\nCALZARE moves at your pace.',
          tagline: 'Stairs, streets, wherever next.\nCALZARE moves at your pace.',
          ctaLabel: 'Shop Men',
          link: '/collections/men',
          imageUrl: '/images/split/men-collection-image.jpg',
          altText: 'Shop Men',
          order: 1,
          isEnabled: true,
          isPublished: true,
          objectPosition: 'center bottom',
          textAlign: 'left',
        },
        {
          id: 'panel_kids',
          title: 'Kids',
          text: 'Little steps. Big personality. Comfort made for every adventure.',
          tagline: 'Little steps. Big personality. Comfort made for every adventure.',
          ctaLabel: 'Shop Kids',
          link: '/collections/kids',
          imageUrl: '/images/split/kids-collection-image.jpg',
          altText: 'Shop Kids',
          order: 2,
          isEnabled: true,
          isPublished: true,
          objectPosition: 'center bottom',
          textAlign: 'left',
        },
        {
          id: 'panel_unisex',
          title: 'Unisex',
          text: 'No labels. No limits. Just comfort that moves with you.',
          tagline: 'No labels. No limits. Just comfort that moves with you.',
          ctaLabel: 'Shop Unisex',
          link: '/collections/unisex',
          imageUrl: '/images/split/unisex-collection-image.jpg',
          altText: 'Shop Unisex',
          order: 3,
          isEnabled: true,
          isPublished: true,
          objectPosition: 'center bottom',
          textAlign: 'left',
        },
      ];

  // Filter panels based on visibility unless inside admin preview mode
  const visiblePanels = sourcePanels
    .filter((p) => {
      if (isPreview) return true;
      return p.isEnabled !== false && p.isPublished !== false;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (visiblePanels.length === 0) return null;

  const isFourColLayout = config.layoutVariant === '4_columns' || (visiblePanels.length === 4 && config.layoutVariant === 'four_columns_wide');

  return (
    <section
      className="shopify-section handoff-shop-split-section"
      id={section?.sectionKey || 'handoff_shop_split'}
      aria-label="Shop by Category"
    >
      <section
        className={`handoff-shop-split ${isFourColLayout ? 'handoff-shop-split--4col' : ''}`}
        id={`HandoffShopSplit-${section?._id || 'split'}`}
      >
        {visiblePanels.map((panel, idx) => {
          const isLeft = idx % 2 === 0;
          const displayCopy = panel.text || panel.tagline || '';
          const resolvedImageUrl = getPanelImage(panel);
          const resolvedMobileImageUrl =
            panel.mobileImageUrl && typeof panel.mobileImageUrl === 'string' && panel.mobileImageUrl.trim() !== ''
              ? panel.mobileImageUrl.trim()
              : null;

          return (
            <article
              key={panel.id || panel._id || idx}
              className={`handoff-shop-split__panel ${
                isLeft ? 'handoff-shop-split__panel--left' : 'handoff-shop-split__panel--right'
              }`}
            >
              {/* Media Container with responsive picture & lazy loading */}
              <div className="handoff-shop-split__media">
                <picture>
                  {resolvedMobileImageUrl && (
                    <source media="(max-width: 749px)" srcSet={resolvedMobileImageUrl} />
                  )}
                  {resolvedImageUrl ? (
                    <img
                      src={resolvedImageUrl}
                      alt={panel.altText || panel.title || `Shop ${panel.title || 'Collection'}`}
                      loading="lazy"
                      decoding="async"
                      className="handoff-shop-split__img"
                      style={{
                        objectPosition: panel.objectPosition || 'center bottom',
                      }}
                      onError={(e) => {
                        // Fallback placeholder if custom image URL breaks
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                  ) : null}
                </picture>
              </div>

              {/* Bottom Editorial Content Overlay */}
              <div className="handoff-shop-split__content">
                <div
                  className="handoff-shop-split__bottom"
                  style={{
                    textAlign: panel.textAlign || 'left',
                    alignItems:
                      panel.textAlign === 'center'
                        ? 'center'
                        : panel.textAlign === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                >
                  <p className="handoff-shop-split__text">
                    {displayCopy.split('\n').map((line, lIdx, arr) => (
                      <React.Fragment key={lIdx}>
                        {line}
                        {lIdx < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>

                  {panel.link && (panel.link.startsWith('http://') || panel.link.startsWith('https://')) ? (
                    <a
                      className="handoff-btn handoff-shop-split__cta"
                      href={panel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {panel.ctaLabel || `Shop ${panel.title || 'Category'}`}
                    </a>
                  ) : (
                    <Link
                      className="handoff-btn handoff-shop-split__cta"
                      to={panel.link || `/collections/${(panel.title || 'shop').toLowerCase()}`}
                    >
                      {panel.ctaLabel || `Shop ${panel.title || 'Category'}`}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
};
