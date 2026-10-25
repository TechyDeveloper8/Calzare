import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Feather, HeartHandshake, RotateCcw, ShieldCheck, Truck, Headphones, Sparkles, ArrowRight } from 'lucide-react';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';

export const BenefitsSection = ({ section }) => {
  const { settings } = useStoreConfig();
  const threshold = settings?.freeShippingThreshold || 999;

  const trustBlocks = [
    {
      icon: Truck,
      title: 'Free Express India Delivery',
      desc: `On all prepaid orders above ₹${threshold}. Tracked dispatch within 24 hours.`,
      link: '/shipping',
      linkLabel: 'Shipping Policy',
    },
    {
      icon: RotateCcw,
      title: '7-Day Doorstep Exchange',
      desc: 'Wrong size or fit? Our courier picks up and replaces your pair at your doorstep.',
      link: '/returns',
      linkLabel: 'Exchange Policy',
    },
    {
      icon: Droplets,
      title: '100% Waterproof EVA Foam',
      desc: 'Non-porous closed-cell compound never absorbs water or odors. Tap wash & go.',
      link: '/shop',
      linkLabel: 'Explore Styles',
    },
    {
      icon: Headphones,
      title: 'Dedicated Customer Care',
      desc: `Direct support via concierge team at ${settings?.contactEmail || 'support@calzare.com'}.`,
      link: '/contact',
      linkLabel: 'Contact Us',
    },
  ];

  return (
    <section style={{ padding: '80px 0 100px', backgroundColor: '#f5f3ee' }} aria-labelledby="benefits-heading">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto 48px' }}>
          <h2 id="benefits-heading" className="section-title section-title--single-line">
            {section.title || 'THE CALZARE STANDARD'}
          </h2>
          {section.subtitle && <p className="section-subtitle" style={{ margin: '0 auto' }}>{section.subtitle}</p>}
        </div>

        <div className="benefits-grid">
          {trustBlocks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="benefit-card glass-panel"
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 24px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div
                  className="benefit-icon-box"
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--canvas-warm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-black)',
                    marginBottom: '18px',
                  }}
                >
                  <Icon size={24} />
                </div>

                <h3 className="benefit-title" style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
                  {item.title}
                </h3>

                <p className="benefit-desc" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px', flexGrow: 1 }}>
                  {item.desc}
                </p>

                <Link
                  to={item.link}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--ink-black)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.linkLabel} <ArrowRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
