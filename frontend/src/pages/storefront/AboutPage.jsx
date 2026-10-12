import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Droplets,
  Feather,
  HeartHandshake,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Editorial Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-eyebrow">THE GENESIS // ARCHITECTURAL FOAM</span>
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              marginTop: '12px',
            }}
          >
            0% BORING.
            <br />
            100% AIR.
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '20px auto 0',
              lineHeight: 1.6,
            }}
          >
            CALZARE was born out of frustration with disposable, hard-plastic clogs that sacrifice aesthetics for comfort or style for orthopedic clunkiness.
          </p>
        </div>

        {/* Large Editorial Imagery Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '72px',
          }}
        >
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              height: '420px',
              position: 'relative',
              background: '#0f0f10',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"
              alt="CALZARE Design Process"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '16px 20px',
                background: 'rgba(15, 15, 16, 0.75)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-lime)', fontWeight: 700 }}>
                Material Integrity
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>Supercritical Closed-Cell Polymers</div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              height: '420px',
              position: 'relative',
              background: '#0f0f10',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=80"
              alt="Urban Streetwear Silhouette"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '16px 20px',
                background: 'rgba(15, 15, 16, 0.75)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-lime)', fontWeight: 700 }}>
                Street Architecture
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>Engineered for 16-Hour Daily Movement</div>
            </div>
          </div>
        </div>

        {/* Brand Narrative Section */}
        <div
          className="glass-panel"
          style={{
            padding: '56px 48px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            boxShadow: '0 20px 48px rgba(0,0,0,0.04)',
            marginBottom: '72px',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="section-eyebrow">OUR DESIGN PHILOSOPHY</span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginTop: '12px',
                marginBottom: '28px',
              }}
            >
              We don’t make shoes. We sculpt buoyancy for pavement poets.
            </h2>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p>
                From tropical monsoon downpours to creative studios, metro interchanges, airport terminals, and mountain trails, modern life demands footwear that adapts without hesitation.
              </p>
              <p>
                Most everyday shoes are held together by toxic contact cement, porous open-cell foam that sponges up street grime, and weak seams that separate within six months. When one stitch rots, the entire shoe is thrown in the trash.
              </p>
              <p>
                <strong>CALZARE does things differently.</strong> Every pair is manufactured using high-pressure monolithic injection molds. There are zero glued seams to delaminate, zero stitching to rot, and zero fabric to soak up mud. A quick 10-second rinse under cold tap water restores every pair to its pristine state.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-eyebrow">THE CALZARE STANDARD</span>
            <h2 style={{ fontSize: '2.4rem', marginTop: '8px' }}>BUILT DIFFERENT BY DESIGN</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--surface-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Droplets size={22} color="var(--ink-black)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>100% Waterproof</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Non-porous closed cells never absorb moisture, puddle water, or body sweat. Zero odor buildup.
              </p>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--surface-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Feather size={22} color="var(--ink-black)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Sub-280g Buoyancy</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Lighter than a standard cup of coffee. Experience kinetic energy rebound with every step.
              </p>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--surface-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Zap size={22} color="var(--ink-black)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>35mm Cloud Platform</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Anatomical arch support contours protect your ankles and lower spine across prolonged daily strides.
              </p>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--surface-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <RotateCcw size={22} color="var(--ink-black)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>7-Day Doorstep Swap</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                If your fit isn’t perfect, our courier brings a fresh size right to your door and picks up the old pair.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Action Banner */}
        <div
          style={{
            padding: '60px 40px',
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ink-black)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <span
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: 'var(--accent-lime)',
              }}
            >
              EXPERIENCE THE DROP
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                lineHeight: 1.1,
                marginTop: '12px',
                marginBottom: '20px',
              }}
            >
              STEP INTO WEIGHTLESS CLOUD COMFORT
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              Browse our complete lineup of clogs, slides, and sandals with instant size availability.
            </p>
            <Link
              to="/shop"
              className="btn-primary"
              style={{
                background: 'var(--accent-lime)',
                color: 'var(--ink-black)',
                padding: '16px 36px',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Shop All Silhouettes <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
