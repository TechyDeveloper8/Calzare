import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const AudienceSection = ({ section }) => {
  const config = section.config || {};
  const cards = config.audienceCards || [
    {
      title: 'WOMEN',
      tagline: 'Sculpted contours & bold vibrant silhouettes.',
      imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'EXPLORE WOMEN',
      link: '/women',
      badge: 'CURATED',
    },
    {
      title: 'MEN',
      tagline: 'High-traction outdoor & rugged everyday mules.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'EXPLORE MEN',
      link: '/men',
      badge: 'POPULAR',
    },
    {
      title: 'KIDS',
      tagline: 'Featherweight, indestructible foam for playground champions.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'EXPLORE KIDS',
      link: '/kids',
      badge: 'MINI SIZES',
    },
    {
      title: 'UNISEX',
      tagline: 'Pure architectural foam with universal ergonomics.',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'EXPLORE UNISEX',
      link: '/unisex',
      badge: 'CORE LINE',
    },
  ];

  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <div className="section-header">
          {section.eyebrow && <span className="section-eyebrow">{section.eyebrow}</span>}
          <h2 className="section-title">{section.title || 'DESIGNED FOR EVERY STRIDE'}</h2>
          {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
        </div>

        <div className="audience-grid">
          {cards.map((card, idx) => (
            <Link key={idx} to={card.link || '/shop'} className="audience-card">
              <img src={card.imageUrl} alt={card.title} className="audience-card-bg" loading="lazy" />
              <div className="audience-card-overlay">
                {card.badge && (
                  <span className="badge-lime" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
                    {card.badge}
                  </span>
                )}
                <h3 className="audience-card-title">{card.title}</h3>
                <p className="audience-card-desc">{card.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-lime)' }}>
                  {card.ctaLabel || 'EXPLORE'} <ArrowUpRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
