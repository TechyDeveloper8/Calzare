import { getAssetUrl } from '../../api/api.js';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const HeroBannerSection = ({ section }) => {
  const config = section.config || {};
  const stickers = config.stickers || [
    { text: '🔥 100% WATERPROOF FOAM', badgeStyle: 'lime_pill', position: 'top_right' },
    { text: '☁️ CLOUDFOOTBED TECH', badgeStyle: 'glass_float', position: 'bottom_left' },
  ];
  const desktopImage = config.desktopMediaUrl?.trim()
    ? getAssetUrl(config.desktopMediaUrl.trim())
    : '';

  const mobileImage = config.mobileMediaUrl?.trim()
    ? getAssetUrl(config.mobileMediaUrl.trim())
    : desktopImage;

  const textAlignment = config.textAlignment || 'left'; // 'left' | 'center' | 'right'
  const overlayOpacity = config.overlayOpacity !== undefined ? config.overlayOpacity : 0.25;

  // Visibility controls (chooseable in admin CMS)
  const rawTitle = section.title !== undefined ? section.title : '0% BORING.\n100% AIR.';
  const showTitle = config.showTitle !== false && Boolean(rawTitle?.trim());

  const rawSubtitle =
    section.subtitle !== undefined
      ? section.subtitle
      : 'Dual-density closed-cell waterproof EVA foam. Sculpted for pavement poets and real life strides.';
  const showSubtitle = config.showSubtitle !== false && Boolean(rawSubtitle?.trim());

  const rawPrimaryCtaLabel = config.primaryCtaLabel !== undefined ? config.primaryCtaLabel : 'EXPLORE COLLECTION';
  const showPrimaryCta = config.showPrimaryCta !== false && Boolean(rawPrimaryCtaLabel?.trim());

  const showSecondaryCta = config.showSecondaryCta !== false && Boolean(config.secondaryCtaLabel?.trim());
  const showStickers = config.showStickers !== false && stickers.length > 0;
  const hasTextContent = showTitle || showSubtitle || showPrimaryCta || showSecondaryCta;

  return (
    <section className="hero-section hero-fullbleed">
      {/* Edge-to-edge full-bleed campaign photography with responsive art direction */}
      <div className="hero-backdrop" style={{ background: '#121214' }}>
        {desktopImage && (
          <picture>
            {mobileImage && <source media="(max-width: 768px)" srcSet={mobileImage} />}
            <img
              src={desktopImage}
              alt={rawTitle ? rawTitle.replace('\n', ' ') : 'CALZARE Campaign Footwear'}
              className="hero-backdrop-img"
              fetchPriority="high"
              loading="eager"
              style={{
                objectPosition: config.focalPoint || 'center center',
              }}
            />
          </picture>
        )}
        {hasTextContent && (
          <div
            className="hero-scrim"
            style={{
              background: desktopImage
                ? `linear-gradient(to right, rgba(15, 15, 16, ${Math.min(0.85, overlayOpacity + 0.5)}) 0%, rgba(15, 15, 16, ${overlayOpacity}) 60%, rgba(15, 15, 16, 0.1) 100%)`
                : 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
            }}
          />
        )}
      </div>

      {/* Foreground Container with Editorial Art Direction */}
      <div className="container hero-container" style={{ position: 'relative', zIndex: 10 }}>
        {hasTextContent && (
          <div
            className="hero-content"
            style={{
              textAlign: textAlignment,
              marginLeft: textAlignment === 'center' ? 'auto' : textAlignment === 'right' ? 'auto' : 0,
              marginRight: textAlignment === 'center' ? 'auto' : 0,
            }}
          >
            {showTitle && <h1 className="hero-title">{rawTitle}</h1>}

            {showSubtitle && <p className="hero-subtitle">{rawSubtitle}</p>}

            {(showPrimaryCta || showSecondaryCta) && (
              <div
                className="hero-cta-group"
                style={{
                  justifyContent: textAlignment === 'center' ? 'center' : textAlignment === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                {showPrimaryCta && (
                  <Link to={config.primaryCtaLink || '/shop'} className="btn-primary btn-lime">
                    {rawPrimaryCtaLabel} <ArrowUpRight size={18} />
                  </Link>
                )}

                {showSecondaryCta && (
                  <Link to={config.secondaryCtaLink || '/new-arrivals'} className="btn-secondary btn-glass">
                    {config.secondaryCtaLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Streetwear Badges */}
        {showStickers && (
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
        )}
      </div>
    </section>
  );
};
