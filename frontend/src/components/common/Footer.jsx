import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';
import { ShieldCheck, Truck, RotateCcw, CreditCard, ArrowRight, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../api/api.js';

export const Footer = () => {
  const { settings, menus } = useStoreConfig();
  const [footerEmail, setFooterEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ loading: false, success: false, message: '' });

  const shopMenu = menus?.footer_shop?.items || [
    { label: 'Cloud Hydro Clogs', url: '/shop?category=clogs' },
    { label: 'Aeroflex Sliders', url: '/shop?category=sliders' },
    { label: 'Rugged Sandals', url: '/shop?category=sandals' },
    { label: 'Foam Walkers', url: '/shop?category=foam-walkers' },
    { label: 'Men Collection', url: '/men' },
    { label: 'Women Collection', url: '/women' },
  ];

  const helpMenu = menus?.footer_help?.items || [
    { label: 'Track My Order', url: '/track-order' },
    { label: 'Official Size Guide', url: '/size-guide' },
    { label: 'Shipping & Delivery', url: '/shipping' },
    { label: 'Return & Exchange Policy', url: '/returns' },
    { label: 'Refund Policy', url: '/refund-policy' },
    { label: 'Frequently Asked Questions', url: '/faq' },
    { label: 'Contact Concierge', url: '/contact' },
  ];

  const aboutMenu = menus?.footer_about?.items || [
    { label: 'About CALZARE', url: '/about' },
    { label: 'The Journal', url: '/journal' },
    { label: 'Active Promotions', url: '/offers' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms & Conditions', url: '/terms' },
  ];

  const handleFooterSubscribe = async (e) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes('@')) return;
    try {
      setSubStatus({ loading: true, success: false, message: '' });
      await api.subscribeNewsletter({ email: footerEmail, source: 'footer_quick_signup' });
      setSubStatus({ loading: false, success: true, message: 'Subscribed!' });
      setFooterEmail('');
    } catch (err) {
      setSubStatus({ loading: false, success: false, message: err.message || 'Error' });
    }
  };

  return (
    <footer className="footer-wrapper" style={{ backgroundColor: 'var(--ink-black)', color: '#ffffff', paddingTop: '80px', paddingBottom: '36px' }}>
      <div className="container">
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
          }}
        >
          {/* Brand Manifesto & Newsletter */}
          <div style={{ gridColumn: 'span 1' }}>
            <div className="brand-logo" style={{ color: '#ffffff', marginBottom: '16px' }}>
              {settings?.storeName || 'CALZARE'}
              <span className="brand-logo-dot" />
            </div>
            <p style={{ color: '#a0a0a8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              {settings?.tagline || 'Good Shoes. Loud Personality.'} Sculpted from closed-cell waterproof EVA foam
              engineered to cradle human movement on pavement, rain, and trails.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#a0a0a8', fontSize: '0.82rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--accent-lime)" />
                <span>{settings?.businessAddress || 'Design Lab, Indiranagar, Bengaluru, India'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--accent-lime)" />
                <a href={`mailto:${settings?.contactEmail || 'Admin@calzareheels.com'}`} style={{ color: '#e2e8f0' }}>
                  {settings?.contactEmail || 'Admin@calzareheels.com'}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--accent-lime)" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Quick footer email subscription */}
            <form onSubmit={handleFooterSubscribe} style={{ display: 'flex', gap: '6px', maxWidth: '320px' }}>
              <input
                type="email"
                placeholder="Join VIP newsletter..."
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 14px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />
              <button
                type="submit"
                className="btn-primary btn-lime"
                style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                disabled={subStatus.loading}
              >
                {subStatus.success ? <CheckCircle size={14} /> : <ArrowRight size={14} />}
              </button>
            </form>
          </div>

          {/* Column 1: Shop */}
          <div>
            <div className="footer-col-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginBottom: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Collections
            </div>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shopMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} style={{ color: '#a0a0a8', fontSize: '0.86rem', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a8'}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <div className="footer-col-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginBottom: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Care & Support
            </div>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {helpMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} style={{ color: '#a0a0a8', fontSize: '0.86rem', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a8'}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Brand & Legal */}
          <div>
            <div className="footer-col-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginBottom: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Studio & Policies
            </div>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {aboutMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} style={{ color: '#a0a0a8', fontSize: '0.86rem', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a8'}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Trust, Accepted Payment Badges & Copyright Bar */}
        <div
          className="footer-bottom-bar"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8rem',
            color: '#71717a',
          }}
        >
          <div>
            © {new Date().getFullYear()} CALZARE™ (Operated by {settings?.legalCompanyName || 'Calzare Heels Private Limited'}). All rights reserved.
          </div>

          {/* Verified Payment Badges */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a1a1aa' }}>
              <ShieldCheck size={16} color="var(--accent-lime)" /> 100% Encrypted Checkout
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a1a1aa' }}>
              <RotateCcw size={16} color="var(--accent-lime)" /> 3-Day Doorstep Exchange
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a1a1aa' }}>
              <Truck size={16} color="var(--accent-lime)" /> Pan-India Express Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
