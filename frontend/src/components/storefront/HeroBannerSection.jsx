import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const HeroBannerSection = ({ section }) => {
  const config = section.config || {};
  const stickers = config.stickers || [
    { text: '🔥 100% WATERPROOF FOAM', badgeStyle: 'lime_pill', position: 'top_right' },
    { text: '☁️ CLOUDFOOTBED TECH', badgeStyle: 'glass_float', position: 'bottom_left' },
  ];

  const heroImage =
    config.desktopMediaUrl ||
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=2000&q=85';

  return (
    <section className="hero-section hero-fullbleed">
      {/* Edge-to-edge full-bleed campaign photography */}
      <div className="hero-backdrop">
        <img
          src={heroImage}
          alt={section.title ? section.title.replace('\n', ' ') : 'CALZARE Footwear Campaign'}
          className="hero-backdrop-img"
        />
        <div className="hero-scrim" />
      </div>

      {/* Foreground Container with Editorial Art Direction */}
      <div className="container hero-container">
        <div className="hero-content">
          {section.eyebrow && (
            <div className="hero-eyebrow">
              <Sparkles size={15} color="var(--accent-lime)" />
              <span>{section.eyebrow.replace(/\s*DROP\s*/gi, ' ').replace(/\/\/\s*\/\//g, '//').trim()}</span>
            </div>
          )}

          <h1 className="hero-title">{section.title || '0% BORING.\n100% AIR.'}</h1>

          <p className="hero-subtitle">
            {section.subtitle ||
              'Dual-density closed-cell waterproof EVA foam. Sculpted for pavement poets and real life strides.'}
          </p>

          <div className="hero-cta-group">
            <Link to={config.primaryCtaLink || '/shop'} className="btn-primary btn-lime">
              {config.primaryCtaLabel && !/drop/i.test(config.primaryCtaLabel)
                ? config.primaryCtaLabel
                : 'EXPLORE COLLECTION'}{' '}
              <ArrowUpRight size={18} />
            </Link>
            {config.secondaryCtaLabel &&
              !/999|drop/i.test(config.secondaryCtaLabel) && (
                <Link to={config.secondaryCtaLink || '/shop'} className="btn-secondary btn-glass">
                  {config.secondaryCtaLabel}
                </Link>
              )}
          </div>
        </div>

        {/* Floating Streetwear Badges across the Full Hero Canvas */}
        <div className="hero-stickers-layer">
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
