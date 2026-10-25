import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  ArrowRight,
  Eye,
  Sparkles,
  ShoppingBag,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ProductCard } from '../../components/common/ProductCard.jsx';

/**
 * Accessible number counter component that animates numeric values
 * while respecting prefers-reduced-motion preferences.
 */
const AnimatedStatValue = ({ value = '', shouldAnimate = true }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // If not numeric (e.g. contains words, or special chars other than % / + / g)
    const match = value.match(/^([^\d]*)(\d+)([^\d]*)$/);
    if (!match || !shouldAnimate) {
      setDisplayValue(value);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const targetNumber = parseInt(match[2], 10);
    const suffix = match[3] || '';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let current = 0;
            const duration = 1200; // ms
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = targetNumber / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= targetNumber) {
                setDisplayValue(`${prefix}${targetNumber}${suffix}`);
                clearInterval(timer);
              } else {
                setDisplayValue(`${prefix}${Math.floor(current)}${suffix}`);
              }
            }, stepTime);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [value, shouldAnimate]);

  return <span ref={containerRef}>{displayValue}</span>;
};

export const AboutPage = () => {
  const [searchParams] = useSearchParams();
  const isPreviewParam = searchParams.get('preview') === 'true';

  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await api.getStoryPage({
          slug: 'about-us',
          ...(isPreviewParam ? { preview: 'true' } : {}),
        });

        if (res.success) {
          setIsPublished(res.isPublished);
          setIsPreview(res.isPreview || false);
          setPageData(res.page);

          // Update SEO document title and meta description
          if (res.page?.metaTitle) {
            document.title = res.page.metaTitle;
          }
          if (res.page?.metaDescription) {
            let metaTag = document.querySelector('meta[name="description"]');
            if (metaTag) {
              metaTag.setAttribute('content', res.page.metaDescription);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load story page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [isPreviewParam]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="skeleton" style={{ width: '240px', height: '32px', margin: '0 auto 16px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '400px', height: '16px', margin: '0 auto', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  // If page is unconfigured or unpublished and not in authorized draft preview
  if (!pageData || (!isPublished && !isPreview)) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div
          style={{
            maxWidth: '560px',
            textAlign: 'center',
            padding: '48px 32px',
            borderRadius: 'var(--radius-xl, 16px)',
            background: 'var(--surface-cream, #f9f8f6)',
            border: '1px solid rgba(15, 15, 16, 0.08)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#0f0f10',
              color: 'var(--accent-lime, #d8ff00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Compass size={28} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              letterSpacing: '-0.02em',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            OUR STORY IS BEING CURATED
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            We are currently documenting our authentic journey, craftsmanship, and materials.
            Check back soon for the official story drop.
          </p>
          <Link
            to="/shop"
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
            }}
          >
            Explore Latest Drops <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const sections = (pageData.sections || []).filter((s) => s.isEnabled !== false);

  return (
    <div className="our-story-page-shell" style={{ width: '100%', overflowX: 'hidden' }}>
      {/* Draft Preview Warning Banner */}
      {isPreview && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: '#f59e0b',
            color: '#0f172a',
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Eye size={16} />
          <span>ADMIN DRAFT PREVIEW MODE — This preview contains unpublished edits and is hidden from public storefront visitors.</span>
          <Link
            to="/admin/our-story"
            style={{
              color: '#0f172a',
              textDecoration: 'underline',
              marginLeft: '10px',
              fontWeight: 800,
            }}
          >
            Back to CMS Editor
          </Link>
        </div>
      )}

      {/* Render CMS Sections In Verified Display Order */}
      {sections.map((section) => {
        const { sectionId, sectionType, config = {} } = section;

        // ---------------------------------------------------------------
        // SECTION A: STORY HERO / THE ORIGIN
        // ---------------------------------------------------------------
        if (sectionType === 'hero') {
          const isDarkTheme = config.backgroundTheme === 'ink_black';
          const bgStyle = isDarkTheme
            ? { background: 'var(--ink-black, #0f0f10)', color: '#ffffff' }
            : { background: 'var(--surface-cream, #f9f8f6)', color: 'var(--ink-black, #0f0f10)' };

          const textAlign = config.textAlign || 'left';

          return (
            <section
              key={sectionId}
              className="story-section story-section--hero"
              style={{
                ...bgStyle,
                position: 'relative',
                overflow: 'hidden',
                padding: 'clamp(60px, 8vw, 120px) 0 clamp(40px, 6vw, 80px)',
              }}
            >
              <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    maxWidth: textAlign === 'center' ? '860px' : '760px',
                    margin: textAlign === 'center' ? '0 auto 48px' : '0 0 48px',
                    textAlign,
                  }}
                >
                  {config.eyebrow && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: config.accentColor || 'var(--accent-lime, #d8ff00)',
                        marginBottom: '16px',
                      }}
                    >
                      {config.eyebrow}
                    </span>
                  )}

                  {config.heading && (
                    <h1
                      style={{
                        fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.02,
                        textTransform: 'uppercase',
                        marginBottom: '20px',
                      }}
                    >
                      {config.heading}
                    </h1>
                  )}

                  {config.paragraph && (
                    <p
                      style={{
                        fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                        color: isDarkTheme ? 'rgba(255,255,255,0.78)' : 'var(--text-secondary, #555)',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {config.paragraph}
                    </p>
                  )}

                  {config.ctaLabel && config.ctaLink && (
                    <div style={{ marginTop: '28px' }}>
                      <Link
                        to={config.ctaLink}
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: config.accentColor || 'var(--accent-lime, #d8ff00)',
                          color: '#0f0f10',
                          fontWeight: 800,
                          padding: '14px 32px',
                        }}
                      >
                        {config.ctaLabel} <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Hero Media Element */}
                {(config.desktopImageUrl || config.videoUrl) && (
                  <div
                    style={{
                      borderRadius: 'var(--radius-2xl, 24px)',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#18181b',
                      maxHeight: '620px',
                      boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                    }}
                  >
                    {config.videoUrl ? (
                      <video
                        src={config.videoUrl}
                        poster={config.desktopImageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          maxHeight: '620px',
                          objectFit: 'cover',
                          objectPosition: config.focalPoint || 'center',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <picture>
                        {config.mobileImageUrl && (
                          <source media="(max-width: 640px)" srcSet={config.mobileImageUrl} />
                        )}
                        <img
                          src={config.desktopImageUrl}
                          alt={config.heading || 'Brand Origin Hero'}
                          loading="eager"
                          style={{
                            width: '100%',
                            height: '100%',
                            maxHeight: '620px',
                            objectFit: 'cover',
                            objectPosition: config.focalPoint || 'center',
                            display: 'block',
                          }}
                        />
                      </picture>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION B: BRAND STATISTICS
        // ---------------------------------------------------------------
        if (sectionType === 'stats') {
          const items = (config.items || []).filter((it) => it.isEnabled !== false && it.value);
          if (items.length === 0) return null; // Hide if no verified metrics configured

          return (
            <section
              key={sectionId}
              className="story-section story-section--stats"
              style={{
                padding: 'clamp(60px, 8vw, 100px) 0',
                background: '#ffffff',
                borderTop: '1px solid rgba(15,15,16,0.06)',
                borderBottom: '1px solid rgba(15,15,16,0.06)',
              }}
            >
              <div className="container" style={{ maxWidth: '1280px' }}>
                {(config.eyebrow || config.heading) && (
                  <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    {config.eyebrow && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary, #666)',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {config.eyebrow}
                      </span>
                    )}
                    {config.heading && (
                      <h2
                        style={{
                          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                          fontWeight: 900,
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase',
                          margin: 0,
                        }}
                      >
                        {config.heading}
                      </h2>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
                    gap: '32px',
                  }}
                >
                  {items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="story-stat-card"
                      style={{
                        padding: '32px 24px',
                        borderRadius: 'var(--radius-lg, 12px)',
                        background: 'var(--surface-cream, #f9f8f6)',
                        border: '1px solid rgba(15,15,16,0.06)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                          fontWeight: 900,
                          letterSpacing: '-0.03em',
                          lineHeight: 1,
                          color: 'var(--ink-black, #0f0f10)',
                          marginBottom: '10px',
                        }}
                      >
                        <AnimatedStatValue value={item.value} shouldAnimate={config.animateOnScroll !== false} />
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--ink-black, #0f0f10)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '6px',
                        }}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary, #666)',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION C: CRAFTSMANSHIP / FACTORY TO FEET
        // ---------------------------------------------------------------
        if (sectionType === 'craftsmanship') {
          const isImageLeft = config.layoutVariant === 'image_left' || config.imagePlacement === 'image_left';

          return (
            <section
              key={sectionId}
              className="story-section story-section--craftsmanship"
              style={{
                padding: 'clamp(70px, 9vw, 130px) 0',
                background: config.backgroundTheme === 'ink_black' ? 'var(--ink-black, #0f0f10)' : '#ffffff',
                color: config.backgroundTheme === 'ink_black' ? '#ffffff' : 'var(--ink-black, #0f0f10)',
              }}
            >
              <div className="container" style={{ maxWidth: '1280px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: ' clamp(32px, 5vw, 64px)',
                    alignItems: 'center',
                  }}
                >
                  {/* Media Column */}
                  <div
                    style={{
                      order: isImageLeft ? 1 : 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {config.primaryImageUrl && (
                      <div
                        style={{
                          borderRadius: 'var(--radius-xl, 20px)',
                          overflow: 'hidden',
                          height: '480px',
                          background: '#18181b',
                        }}
                      >
                        <img
                          src={config.primaryImageUrl}
                          alt={config.heading || 'Craftsmanship Image'}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    {config.secondaryImageUrl && (
                      <div
                        style={{
                          borderRadius: 'var(--radius-lg, 12px)',
                          overflow: 'hidden',
                          height: '240px',
                          background: '#18181b',
                        }}
                      >
                        <img
                          src={config.secondaryImageUrl}
                          alt={config.heading || 'Craftsmanship Detail'}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Editorial Copy Column */}
                  <div
                    style={{
                      order: isImageLeft ? 2 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {config.eyebrow && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--accent-lime, #d8ff00)',
                        }}
                      >
                        {config.eyebrow}
                      </span>
                    )}

                    {config.heading && (
                      <h2
                        style={{
                          fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                          fontWeight: 900,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.08,
                          textTransform: 'uppercase',
                          margin: 0,
                        }}
                      >
                        {config.heading}
                      </h2>
                    )}

                    {config.richText && (
                      <div
                        style={{
                          fontSize: '1.05rem',
                          lineHeight: 1.8,
                          color: config.backgroundTheme === 'ink_black' ? 'rgba(255,255,255,0.78)' : 'var(--text-secondary, #555)',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {config.richText}
                      </div>
                    )}

                    {config.ctaLabel && config.ctaLink && (
                      <div style={{ marginTop: '12px' }}>
                        <Link
                          to={config.ctaLink}
                          className="btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {config.ctaLabel} <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION D: OUR JOURNEY TIMELINE
        // ---------------------------------------------------------------
        if (sectionType === 'timeline') {
          const milestones = (config.milestones || []).filter((m) => m.isEnabled !== false);
          if (milestones.length === 0) return null;

          return (
            <section
              key={sectionId}
              className="story-section story-section--timeline"
              style={{
                padding: 'clamp(70px, 9vw, 130px) 0',
                background: 'var(--surface-cream, #f9f8f6)',
              }}
            >
              <div className="container" style={{ maxWidth: '1080px' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                  {config.eyebrow && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary, #666)',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {config.eyebrow}
                    </span>
                  )}
                  {config.heading && (
                    <h2
                      style={{
                        fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {config.heading}
                    </h2>
                  )}
                </div>

                {/* Vertical Timeline Spine */}
                <div
                  style={{
                    position: 'relative',
                    paddingLeft: '32px',
                    borderLeft: '2px solid rgba(15, 15, 16, 0.15)',
                    marginLeft: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '48px',
                  }}
                >
                  {milestones.map((ms, idx) => (
                    <div
                      key={ms.id || idx}
                      style={{
                        position: 'relative',
                      }}
                    >
                      {/* Timeline Node Marker */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-40px',
                          top: '4px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--accent-lime, #d8ff00)',
                          border: '3px solid var(--ink-black, #0f0f10)',
                        }}
                      />

                      {ms.yearOrDate && (
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: 'var(--ink-black, #0f0f10)',
                            background: '#ffffff',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            border: '1px solid rgba(15,15,16,0.1)',
                            display: 'inline-block',
                            marginBottom: '10px',
                          }}
                        >
                          {ms.yearOrDate}
                        </span>
                      )}

                      <h3
                        style={{
                          fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                          fontWeight: 800,
                          margin: '0 0 10px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {ms.heading}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.98rem',
                          color: 'var(--text-secondary, #555)',
                          lineHeight: 1.6,
                          maxWidth: '680px',
                          margin: '0 0 16px',
                        }}
                      >
                        {ms.description}
                      </p>

                      {ms.mediaUrl && (
                        <div
                          style={{
                            maxWidth: '520px',
                            borderRadius: 'var(--radius-lg, 12px)',
                            overflow: 'hidden',
                            marginTop: '12px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                          }}
                        >
                          <img
                            src={ms.mediaUrl}
                            alt={ms.heading || 'Milestone photography'}
                            loading="lazy"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION E: PRODUCT PHILOSOPHY & LIVE CATALOG RAIL
        // ---------------------------------------------------------------
        if (sectionType === 'philosophy') {
          const products = section.hydratedProducts || [];

          return (
            <section
              key={sectionId}
              className="story-section story-section--philosophy"
              style={{
                padding: 'clamp(70px, 9vw, 130px) 0',
                background: '#ffffff',
              }}
            >
              <div className="container" style={{ maxWidth: '1280px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '48px',
                    alignItems: 'center',
                    marginBottom: products.length > 0 ? '64px' : '0',
                  }}
                >
                  <div>
                    {config.eyebrow && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary, #666)',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {config.eyebrow}
                      </span>
                    )}

                    {config.heading && (
                      <h2
                        style={{
                          fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                          fontWeight: 900,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.08,
                          textTransform: 'uppercase',
                          margin: '0 0 20px',
                        }}
                      >
                        {config.heading}
                      </h2>
                    )}

                    {config.supportingCopy && (
                      <p
                        style={{
                          fontSize: '1.05rem',
                          color: 'var(--text-secondary, #555)',
                          lineHeight: 1.8,
                          margin: 0,
                        }}
                      >
                        {config.supportingCopy}
                      </p>
                    )}

                    {config.ctaLabel && config.ctaLink && (
                      <div style={{ marginTop: '28px' }}>
                        <Link
                          to={config.ctaLink}
                          className="btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          {config.ctaLabel} <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {config.mediaUrl && (
                    <div
                      style={{
                        borderRadius: 'var(--radius-xl, 20px)',
                        overflow: 'hidden',
                        height: '420px',
                        background: '#18181b',
                      }}
                    >
                      <img
                        src={config.mediaUrl}
                        alt={config.heading || 'Product Philosophy'}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                {/* Connected Real Catalog Products Rail */}
                {config.showProductRail && products.length > 0 && (
                  <div
                    style={{
                      paddingTop: '48px',
                      borderTop: '1px solid rgba(15,15,16,0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '32px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase',
                          margin: 0,
                        }}
                      >
                        {config.railHeading || 'FEATURED SILHOUETTES'}
                      </h3>
                      <Link
                        to="/shop"
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--ink-black, #0f0f10)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        View All <ArrowRight size={14} />
                      </Link>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '24px',
                      }}
                    >
                      {products.map((prod) => (
                        <ProductCard key={prod._id} product={prod} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION F: MANUFACTURING PROCESS
        // ---------------------------------------------------------------
        if (sectionType === 'manufacturing') {
          const stages = (config.stages || []).filter((s) => s.isEnabled !== false && (s.title || s.description));
          if (stages.length === 0) return null; // Hide if no real manufacturing data exists

          return (
            <section
              key={sectionId}
              className="story-section story-section--manufacturing"
              style={{
                padding: 'clamp(70px, 9vw, 130px) 0',
                background: 'var(--surface-cream, #f9f8f6)',
              }}
            >
              <div className="container" style={{ maxWidth: '1280px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  {config.eyebrow && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary, #666)',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {config.eyebrow}
                    </span>
                  )}
                  {config.heading && (
                    <h2
                      style={{
                        fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {config.heading}
                    </h2>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '28px',
                  }}
                >
                  {stages.map((stg, idx) => (
                    <div
                      key={stg.id || idx}
                      className="story-stage-card"
                      style={{
                        background: '#ffffff',
                        borderRadius: 'var(--radius-xl, 16px)',
                        overflow: 'hidden',
                        border: '1px solid rgba(15,15,16,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {stg.mediaUrl && (
                        <div style={{ height: '220px', background: '#18181b', overflow: 'hidden' }}>
                          <img
                            src={stg.mediaUrl}
                            alt={stg.title || 'Stage photography'}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: 'var(--accent-lime, #d8ff00)',
                            background: 'var(--ink-black, #0f0f10)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            alignSelf: 'flex-start',
                            marginBottom: '12px',
                          }}
                        >
                          STAGE {stg.stepNumber || idx + 1}
                        </span>

                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            margin: '0 0 10px',
                          }}
                        >
                          {stg.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.92rem',
                            color: 'var(--text-secondary, #666)',
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {stg.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // ---------------------------------------------------------------
        // SECTION G: CLOSING BRAND STATEMENT
        // ---------------------------------------------------------------
        if (sectionType === 'closing_statement') {
          const isDark = config.backgroundTheme !== 'warm_cream';

          return (
            <section
              key={sectionId}
              className="story-section story-section--closing"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: 'clamp(80px, 12vw, 160px) 0',
                background: isDark ? 'var(--ink-black, #0f0f10)' : 'var(--surface-cream, #f9f8f6)',
                color: isDark ? '#ffffff' : 'var(--ink-black, #0f0f10)',
                textAlign: 'center',
              }}
            >
              {/* Optional Background Media */}
              {config.desktopImageUrl && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    opacity: 0.25,
                  }}
                >
                  <picture>
                    {config.mobileImageUrl && (
                      <source media="(max-width: 640px)" srcSet={config.mobileImageUrl} />
                    )}
                    <img
                      src={config.desktopImageUrl}
                      alt="Brand Statement Background"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: config.imagePositioning || 'center',
                      }}
                    />
                  </picture>
                </div>
              )}

              <div className="container" style={{ maxWidth: '920px', position: 'relative', zIndex: 1 }}>
                {config.eyebrow && (
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: config.accentColor || 'var(--accent-lime, #d8ff00)',
                      display: 'inline-block',
                      marginBottom: '16px',
                    }}
                  >
                    {config.eyebrow}
                  </span>
                )}

                {config.mainStatement && (
                  <h2
                    style={{
                      fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.05,
                      textTransform: 'uppercase',
                      margin: '0 0 24px',
                    }}
                  >
                    {config.mainStatement}
                  </h2>
                )}

                {config.supportingText && (
                  <p
                    style={{
                      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                      color: isDark ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary, #555)',
                      lineHeight: 1.7,
                      maxWidth: '680px',
                      margin: '0 auto 36px',
                    }}
                  >
                    {config.supportingText}
                  </p>
                )}

                {config.ctaLabel && config.ctaLink && (
                  <div>
                    <Link
                      to={config.ctaLink}
                      className="btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: config.accentColor || 'var(--accent-lime, #d8ff00)',
                        color: '#0f0f10',
                        fontWeight: 800,
                        padding: '16px 36px',
                        fontSize: '1rem',
                      }}
                    >
                      {config.ctaLabel} <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
};
