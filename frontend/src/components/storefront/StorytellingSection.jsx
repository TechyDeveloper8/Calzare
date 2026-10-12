import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
    ctaLink: '/pages/about-us',
  };

  return (
    <section style={{ padding: '80px 0 120px' }}>
      <div className="container">
        <div className="storytelling-grid">
          {/* Narrative Column */}
          <div>
            {section.eyebrow && <span className="section-eyebrow">{section.eyebrow}</span>}
            <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', marginBottom: '24px' }}>
              {story.headline || section.title}
            </h2>

            {story.quote && <blockquote className="story-quote">{story.quote}</blockquote>}

            <p className="story-body">{story.bodyText}</p>

            <div style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '32px' }}>
              {story.signature}
            </div>

            <Link to={story.ctaLink || '/pages/about-us'} className="btn-secondary">
              {story.ctaLabel || 'DISCOVER OUR CRAFT'} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Asymmetric Dual Photo Composition */}
          <div className="story-images-composition">
            <img
              src={story.primaryImageUrl}
              alt="Editorial craftsmanship"
              className="story-img-main"
              loading="lazy"
            />
            <img
              src={story.secondaryImageUrl}
              alt="Detailed foam texture"
              className="story-img-inset"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
