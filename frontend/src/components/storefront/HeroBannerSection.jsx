import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const HeroBannerSection = ({ section }) => {
  const config = section.config || {};
  const stickers = config.stickers || [
    { text: '🔥 100% WATERPROOF FOAM', badgeStyle: 'lime_pill', position: 'top_right' },
    { text: '☁️ CLOUDFOOTBED TECH', badgeStyle: 'glass_float', position: 'bottom_left' },
  ];

  const desktopImage =
    config.desktopMediaUrl?.trim() ||
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=2000&q=85';

  const mobileImage =
    config.mobileMediaUrl?.trim() ||
    desktopImage;

  const textAlignment = config.textAlignment || 'left'; // 'left' | 'center' | 'right'
  const overlayOpacity = config.overlayOpacity !== undefined ? config.overlayOpacity : 0.25;

  return (
    <section className="hero-section hero-fullbleed">
      {/* Edge-to-edge full-bleed campaign photography with responsive art direction */}
      <div className="hero-backdrop">
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileImage} />
          <img
            src={desktopImage}
            alt={section.title ? section.title.replace('\n', ' ') : 'CALZARE Campaign Footwear'}
            className="hero-backdrop-img"
            fetchPriority="high"
            loading="eager"
            style={{
              objectPosition: config.focalPoint || 'center center',
            }}
          />
        </picture>
        <div
          className="hero-scrim"
          style={{
            background: `linear-gradient(to right, rgba(15, 15, 16, ${Math.min(0.85, overlayOpacity + 0.5)}) 0%, rgba(15, 15, 16, ${overlayOpacity}) 60%, rgba(15, 15, 16, 0.1) 100%)`,
          }}
        />
      </div>

      {/* Foreground Container with Editorial Art Direction */}
      <div className="container hero-container" style={{ position: 'relative', zIndex: 10 }}>
        <div
          className="hero-content"
          style={{
            textAlign: textAlignment,
            marginLeft: textAlignment === 'center' ? 'auto' : textAlignment === 'right' ? 'auto' : 0,
            marginRight: textAlignment === 'center' ? 'auto' : 0,
          }}
        >
          <h1 className="hero-title">{section.title || '0% BORING.\n100% AIR.'}</h1>

          <p className="hero-subtitle">
            {section.subtitle ||
              'Dual-density closed-cell waterproof EVA foam. Sculpted for pavement poets and real life strides.'}
          </p>

          <div
            className="hero-cta-group"
            style={{
              justifyContent: textAlignment === 'center' ? 'center' : textAlignment === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            <Link to={config.primaryCtaLink || '/shop'} className="btn-primary btn-lime">
              {config.primaryCtaLabel || 'EXPLORE COLLECTION'} <ArrowUpRight size={18} />
            </Link>

            {config.secondaryCtaLabel && (
              <Link to={config.secondaryCtaLink || '/new-arrivals'} className="btn-secondary btn-glass">
                {config.secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Floating Streetwear Badges */}
        <div className="hero-stickers-layer" aria-hidden="true">
          {stickers.map((stk, i) => {
            const posClass = stk.position === 'top_right' ? 'top-right' : 'bottom-left';
            return (
              <div key={i} className={`hero-floating-badge ${posClass}`}>
                <span className={stk.badgeStyle === 'lime_pill' ? 'badge-lime' : 'badge-glass'}>
                  {stk.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
