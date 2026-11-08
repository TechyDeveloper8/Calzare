import { getAssetUrl } from '../../api/api.js';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/**
 * Editorial Price-Led Product Carousel (/999 Store)
 * Exact match to Solaworld reference layout, card sizing, typography, and interactive behavior.
 */
export const AffordableStoreSection = ({ section, onQuickView }) => {
  const products = section?.dynamicProducts || [];
  const config = section?.config || {};
  const scrollerRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // Authoritative minimum price derived from actual qualifying products
  const lowestPrice =
    section?.actualStartingPrice ||
    (products.length > 0
      ? Math.min(...products.map((p) => p.baseSalePrice || p.price || 999))
      : config.priceCap || 999);


  const rawHeadline =
    config.campaignHeadline ||
    (section?.title && section.title !== 'THE UNDER ₹999 STORE'
      ? section.title
      : 'Your day\nfound its footing.');

  const headlineLines = rawHeadline.split('\n');

  const rawDescription =
    config.campaignDescription ||
    (section?.subtitle
      ? section.subtitle
      : `Everyday CALZARE, everyday price.\nStarting ₹${lowestPrice.toLocaleString('en-IN')}`);

  const descriptionLines = rawDescription.split('\n');

  const ctaLabel = config.primaryCtaLabel || config.ctaLabel || 'EXPLORE';
  const ctaLink = config.primaryCtaLink || config.ctaLink || '/collections/all';

  // Creative photography with art direction
  const desktopImg =
    config.desktopMediaUrl?.trim()
      ? getAssetUrl(config.desktopMediaUrl.trim())
      : config.campaignImage?.trim()
      ? getAssetUrl(config.campaignImage.trim())
      : '/images/store999/promo.jpg';

  // If mobile image is still pointing to seed default promo.jpg, use custom uploaded desktopImg
  const mobileImg =
    config.mobileMediaUrl?.trim() && config.mobileMediaUrl !== '/images/store999/promo.jpg'
      ? getAssetUrl(config.mobileMediaUrl.trim())
      : config.mobileImage?.trim() && config.mobileImage !== '/images/store999/promo.jpg'
      ? getAssetUrl(config.mobileImage.trim())
      : desktopImg;

  const badgeImg =
    config.badgeImageUrl?.trim()
      ? getAssetUrl(config.badgeImageUrl.trim())
      : config.campaignBadgeImg?.trim()
      ? getAssetUrl(config.campaignBadgeImg.trim())
      : '/images/store999/badge.png';

  const focalPoint = config.focalPoint || 'center';
  const promoBgColor = config.promoBgColor || '#0147af';
  const promoTint = config.overlayTint || '#0147af';
  const overlayOpacity = config.overlayOpacity !== undefined ? config.overlayOpacity : 0.75;

  // Exact card width calculation matching Solaworld JS
  const layoutCards = useCallback(() => {
    if (!scrollerRef.current) return;
    const scroller = scrollerRef.current;
    const style = window.getComputedStyle(scroller);

    const rawVisible = style.getPropertyValue('--store999-visible').trim();
    const visible = parseFloat(rawVisible) > 0 ? parseFloat(rawVisible) : 2;

    const rawGap = style.getPropertyValue('--store999-gap').trim();
    const gap = isNaN(parseFloat(rawGap)) ? 20 : parseFloat(rawGap);

    let gapCount = Math.max(visible - 1, 0);
    if (visible > 1 && visible < 2) gapCount = 1;

    const width = (scroller.clientWidth - gap * gapCount) / visible;
    if (width > 0) {
      scroller.style.setProperty('--store999-card-width', `${width}px`);
    }
  }, []);

  const cardStep = useCallback(() => {
    if (!scrollerRef.current) return 220;
    const scroller = scrollerRef.current;
    const style = window.getComputedStyle(scroller);
    const cardWidth = parseFloat(style.getPropertyValue('--store999-card-width')) || 200;
    const rawGap = style.getPropertyValue('--store999-gap').trim();
    const gap = isNaN(parseFloat(rawGap)) ? 20 : parseFloat(rawGap);
    return cardWidth + gap;
  }, []);

  const updateButtons = useCallback(() => {
    if (!scrollerRef.current) return;
    const scroller = scrollerRef.current;
    const style = window.getComputedStyle(scroller);
    const rawVisible = style.getPropertyValue('--store999-visible').trim();
    const visible = parseFloat(rawVisible) > 0 ? parseFloat(rawVisible) : 2;

    const count = products.length;
    const hasOverflow = count > visible;
    setShowNav(hasOverflow);

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const atStart = scroller.scrollLeft <= 2;
    const atEnd = scroller.scrollLeft >= maxScroll - 2 || maxScroll <= 0;

    setCanScrollLeft(!atStart && hasOverflow && maxScroll > 0);
    setCanScrollRight(!atEnd && hasOverflow && maxScroll > 0);
  }, [products.length]);

  const refresh = useCallback(() => {
    layoutCards();
    updateButtons();
  }, [layoutCards, updateButtons]);

  useEffect(() => {
    refresh();

    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', updateButtons, { passive: true });
    }

    window.addEventListener('resize', refresh);

    let resizeObserver = null;
    if (scroller && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        refresh();
      });
      resizeObserver.observe(scroller);
    }

    const timer = setTimeout(refresh, 200);

    return () => {
      if (scroller) scroller.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', refresh);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [refresh, updateButtons, products]);

  const scrollByCard = (direction) => {
    if (!scrollerRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scrollerRef.current.scrollBy({
      left: direction * cardStep(),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCard(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCard(1);
    }
  };

  // When published, section always renders its campaign panel even if inventory is restocked

  const sectionId = section?._id || 'store-999';

  return (
    <section
      className="handoff-store-999"
      id={`HandoffStore999-${sectionId}`}
      aria-label="Affordable Store"
    >
      <div className="handoff-store-999__inner">
        {/* LEFT: Promotional Campaign Panel */}
        <div className="handoff-store-999__promo" style={{ backgroundColor: promoBgColor }}>
          <div className="handoff-store-999__promo-media" aria-hidden="true">
            <picture>
              {mobileImg && <source media="(max-width: 989px)" srcSet={mobileImg} />}
              <img
                className="handoff-store-999__promo-img"
                src={desktopImg}
                alt=""
                loading="lazy"
                width="601"
                height="715"
                style={{ objectPosition: focalPoint }}
              />
            </picture>
            <span
              className="handoff-store-999__promo-tint"
              style={{
                backgroundColor: promoTint,
                opacity: overlayOpacity,
              }}
            />
          </div>

          <div className="handoff-store-999__promo-content">
            <p className="handoff-store-999__eyebrow">
              {config.campaignEyebrow || section?.eyebrow || '/999 Store'}
            </p>
            <h2 className="handoff-store-999__heading">
              {headlineLines.map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < headlineLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>

            <p className="handoff-store-999__text">
              {descriptionLines.map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < descriptionLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>

            <div className="handoff-store-999__promo-footer">
              <Link className="handoff-btn handoff-store-999__cta" to={ctaLink}>
                {ctaLabel}
              </Link>
              {badgeImg && (
                <img
                  className="handoff-store-999__badge"
                  src={badgeImg}
                  width="62"
                  height="62"
                  alt="Quality Badge"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Horizontal Product Rail */}
        <div className="handoff-store-999__products" data-handoff-store-999>
          <div
            ref={scrollerRef}
            className="handoff-store-999__scroller"
            data-handoff-999-scroller
            role="region"
            aria-label="Qualifying products collection"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="handoff-store-999__track">
              {products.length > 0 ? (
                products.map((product) => {
                  const pIdStr = String(product._id);
                  const cutoutUrl =
                    config.productCutoutImages?.[product._id] ||
                    config.productCutoutImages?.[pIdStr] ||
                    product.cutoutImage;
                  const hasCutout = Boolean(cutoutUrl);
                  const rawImg =
                    cutoutUrl ||
                    product.defaultImages?.[0]?.url ||
                    product.defaultImages?.[0] ||
                    '';
                  const displayImg = rawImg ? getAssetUrl(rawImg) : '';

                  const displayPrice =
                    product.baseSalePrice || product.price || lowestPrice;

                  return (
                    <article key={product._id} className="handoff-store-999__card">
                      <Link
                        className="handoff-store-999__card-link"
                        to={`/product/${product.slug}`}
                      >
                        <div className="handoff-store-999__card-media">
                          {displayImg ? (
                            <img
                              src={displayImg}
                              alt={product.name}
                              width="276"
                              height="198"
                              loading="lazy"
                              className={`handoff-store-999__card-img ${hasCutout ? 'handoff-store-999__card-img--cutout' : ''}`}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '198px',
                                background: '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                              }}
                            >
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <path d="M3.5 13h17M3.5 13a4.5 4.5 0 0 0 4.5 4.5h8a4.5 4.5 0 0 0 4.5-4.5M3.5 13l2-6a3 3 0 0 1 3-2h7a3 3 0 0 1 3 2l2 6" />
                              </svg>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', marginTop: '6px' }}>
                                CALZARE
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="handoff-store-999__card-title">{product.name}</h3>
                        <p className="handoff-store-999__card-price">
                          ₹{displayPrice.toLocaleString('en-IN')}
                        </p>
                      </Link>
                    </article>
                  );
                })
              ) : (
                <article
                  className="handoff-store-999__card"
                  style={{
                    minWidth: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '36px 20px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      marginBottom: '12px',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3.5 13h17M3.5 13a4.5 4.5 0 0 0 4.5 4.5h8a4.5 4.5 0 0 0 4.5-4.5M3.5 13l2-6a3 3 0 0 1 3-2h7a3 3 0 0 1 3 2l2 6" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    NEW DROPS INCOMING
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px', lineHeight: 1.4 }}>
                    Everyday comfort silhouettes are currently being restocked.
                  </p>
                  <Link to="/shop" className="btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px', textDecoration: 'none' }}>
                    EXPLORE ALL STYLES
                  </Link>
                </article>
              )}
            </div>
          </div>

          {/* Minimal Pill Arrow Controls */}
          <div className={`handoff-store-999__nav ${showNav ? 'is-visible' : ''}`}>
            <button
              type="button"
              className="handoff-store-999__arrow"
              data-handoff-999-prev
              aria-label="Previous"
              disabled={!canScrollLeft}
              onClick={() => scrollByCard(-1)}
            >
              <svg width="51" height="29" viewBox="0 0 51 29" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="50" height="28" rx="14" stroke="currentColor" />
                <path
                  d="M34 14.5H18M18 14.5l3.5-3.5M18 14.5l3.5 3.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="handoff-store-999__arrow"
              data-handoff-999-next
              aria-label="Next"
              disabled={!canScrollRight}
              onClick={() => scrollByCard(1)}
            >
              <svg width="51" height="29" viewBox="0 0 51 29" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="50" height="28" rx="14" stroke="currentColor" />
                <path
                  d="M18 14.5h16M34 14.5l-3.5-3.5M34 14.5l-3.5 3.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
