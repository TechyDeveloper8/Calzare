import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const CategoryDiscoverySection = ({ section }) => {
  const config = section.config || {};
  const tiles = config.categoryTiles || [
    {
      title: 'CLOUD CLOGS',
      subtitle: 'Arch ventilation & pivot heel straps',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=clogs',
    },
    {
      title: 'URBAN SLIDERS',
      subtitle: '35mm thick shock absorbent sole',
      imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=sliders',
    },
    {
      title: 'HYDRO SANDALS',
      subtitle: 'Trail lugs for wet terrain grip',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=sandals',
    },
    {
      title: 'FOAM WALKERS',
      subtitle: 'Avant-garde streetwear mules',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=foam-walkers',
    },
  ];

  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{section.title || 'CHOOSE YOUR SILHOUETTE'}</h2>
          {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {tiles.map((tile, idx) => (
            <Link
              key={idx}
              to={tile.link}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                transition: 'transform var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ height: '220px', overflow: 'hidden', background: '#f5f3ee' }}>
                <img
                  src={tile.imageUrl}
                  alt={tile.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '0 0 4px 0' }}>
                    {tile.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-muted)' }}>{tile.subtitle}</p>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--canvas-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
