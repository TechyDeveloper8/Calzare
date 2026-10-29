import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const sanitizeLink = (rawLink) => {
  if (!rawLink) return '/shop';
  const trimmed = rawLink.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      if (
        url.origin === window.location.origin ||
        url.hostname.includes('localhost') ||
        url.hostname.includes('127.0.0.1')
      ) {
        return url.pathname + url.search + url.hash;
      }
      return trimmed;
    }
  } catch {
    // Return relative path fallback
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const CategoryDiscoverySection = ({ section }) => {
  const config = section?.config || {};
  const rawTiles = config.categoryTiles?.length
    ? config.categoryTiles
    : [
        {
          id: 'tile_clogs',
          title: 'CLOUD CLOGS',
          subtitle: 'Arch ventilation & pivot heel straps',
          imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
          link: '/shop?category=clogs',
          badge: 'Popular',
          isEnabled: true,
          order: 0,
        },
        {
          id: 'tile_sliders',
          title: 'URBAN SLIDERS',
          subtitle: '35mm thick shock absorbent sole',
          imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
          link: '/shop?category=sliders',
          badge: 'Trending',
          isEnabled: true,
          order: 1,
        },
        {
          id: 'tile_sandals',
          title: 'HYDRO SANDALS',
          subtitle: 'Trail lugs for wet terrain grip',
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
          link: '/shop?category=sandals',
          badge: 'All-Terrain',
          isEnabled: true,
          order: 2,
        },
        {
          id: 'tile_foam_walkers',
          title: 'FOAM WALKERS',
          subtitle: 'Avant-garde streetwear mules',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          link: '/shop?category=foam-walkers',
          badge: 'Streetwear',
          isEnabled: true,
          order: 3,
        },
      ];

  const tiles = rawTiles
    .filter((tile) => tile.isEnabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!tiles.length) return null;

  return (
    <section style={{ padding: '60px 0 100px' }} aria-label="Silhouette Categories">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          {section?.eyebrow && (
            <span
              style={{
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              {section.eyebrow}
            </span>
          )}
          <h2 className="section-title">{section?.title || 'CHOOSE YOUR SILHOUETTE'}</h2>
          {section?.subtitle && (
            <p className="section-subtitle" style={{ maxWidth: '640px', marginTop: '6px' }}>
              {section.subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {tiles.map((tile, idx) => {
            const destination = sanitizeLink(tile.link);
            const isExternal = destination.startsWith('http://') || destination.startsWith('https://');

            const content = (
              <>
                <div
                  style={{
                    height: '240px',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: tile.imageFit === 'cover' ? '0' : '16px',
                  }}
                >
                  <img
                    src={
                      tile.imageUrl?.trim() ||
                      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={tile.title || 'Footwear Silhouette'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: tile.imageFit === 'cover' ? '100%' : 'auto',
                      height: tile.imageFit === 'cover' ? '100%' : 'auto',
                      objectFit: tile.imageFit || 'contain',
                      objectPosition: 'center',
                      transition: 'transform 0.4s ease',
                      display: 'block',
                      margin: 'auto',
                    }}
                    loading="lazy"
                  />
                  {tile.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '4px 9px',
                        borderRadius: '999px',
                      }}
                    >
                      {tile.badge}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexGrow: 1,
                  }}
                >
                  <div style={{ paddingRight: '12px' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        margin: '0 0 4px 0',
                        color: 'var(--ink-black)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {tile.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        margin: 0,
                        color: 'var(--text-muted)',
                        lineHeight: 1.4,
                      }}
                    >
                      {tile.subtitle}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--canvas-warm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.2s ease, background-color 0.2s ease',
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </>
            );

            const cardStyle = {
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
            };

            const handleEnter = (e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1.04)';
            };

            const handleLeave = (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1)';
            };

            if (isExternal) {
              return (
                <a
                  key={tile.id || idx}
                  href={destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel"
                  style={cardStyle}
                  onMouseEnter={handleEnter}
                  onMouseLeave={handleLeave}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={tile.id || idx}
                to={destination}
                className="glass-panel"
                style={cardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
