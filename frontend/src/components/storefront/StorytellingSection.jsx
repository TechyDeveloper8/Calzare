import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const StorytellingSection = ({ section }) => {
  const config = section.config || {};
  const story = config.storytelling || {
    headline: 'WE DON’T DO FLAT SOLES OR RIGID PLASTIC.',
    quote: '“Footwear should act like an extension of gravity, not a restriction on it.”',
    bodyText:
      'We tested 42 foam compound densities across Bengaluru pavement, Mumbai monsoons, and Jaipur heat before releasing our Apex silhouette. The outcome: closed-cell buoyancy that supports your arch while letting you walk 20,000 steps without calf fatigue.',
    signature: 'CALZARE DESIGN LAB, BENGALURU',
    primaryImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ctaLabel: 'READ THE FULL STORY',
    ctaLink: '/about',
  };

  return (
    <section style={{ padding: '90px 0 120px', background: 'var(--canvas-warm)' }} aria-labelledby="storytelling-heading">
      <div className="container">
        <div className="storytelling-grid">
          {/* Narrative Column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2
              id="storytelling-heading"
              className="section-title"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', marginBottom: '24px', lineHeight: 1.08 }}
            >
              {story.headline || section.title}
            </h2>

            {story.quote && (
              <blockquote className="story-quote" style={{ fontStyle: 'italic', borderLeft: '3px solid var(--accent-lime)', paddingLeft: '16px', margin: '0 0 20px 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600 }}>
                {story.quote}
              </blockquote>
            )}

            <p className="story-body" style={{ fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {story.bodyText}
            </p>

            <div style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '32px' }}>
              {story.signature}
            </div>

            <div>
              <Link to={story.ctaLink || '/about'} className="btn-primary" style={{ display: 'inline-flex', padding: '14px 28px', fontSize: '0.86rem' }}>
                {story.ctaLabel || 'DISCOVER OUR CRAFT'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Asymmetric Dual Photo Composition */}
          <div className="story-images-composition" style={{ position: 'relative' }}>
            <img
              src={story.primaryImageUrl}
              alt="CALZARE architectural foam craftsmanship"
              className="story-img-main"
              loading="lazy"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-xl)',
                objectFit: 'cover',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
              }}
            />
            {story.secondaryImageUrl && (
              <img
                src={story.secondaryImageUrl}
                alt="Detailed foam sole texture"
                className="story-img-inset"
                loading="lazy"
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '-25px',
                  width: '45%',
                  borderRadius: 'var(--radius-lg)',
                  border: '6px solid var(--canvas-warm)',
                  objectFit: 'cover',
                  boxShadow: '0 15px 30px -5px rgba(0,0,0,0.2)',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
