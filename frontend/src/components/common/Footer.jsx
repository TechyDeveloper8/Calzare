import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';
import { ShieldCheck, Truck, RotateCcw, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../../api/api.js';

export const Footer = () => {
  const { settings, menus } = useStoreConfig();
  const [footerEmail, setFooterEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ loading: false, success: false, message: '' });

  const helpMenu = (menus?.footer_help?.items && menus.footer_help.items.length > 0)
    ? menus.footer_help.items
    : [
        { label: 'Contact Us', url: '/contact' },
        { label: 'Track My Order', url: '/track-order' },
        { label: 'Official Size Guide', url: '/size-guide' },
        { label: 'Frequently Asked Questions', url: '/faq' },
        { label: 'About CALZARE', url: '/about' },
      ];

  const policyMenu = (menus?.footer_about?.items && menus.footer_about.items.length > 0)
    ? menus.footer_about.items
    : [
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Shipping & Delivery Policy', url: '/shipping' },
        { label: 'Return & Exchange Policy', url: '/returns' },
        { label: 'Refund Policy', url: '/refund-policy' },
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
        <div className="footer-grid">
          {/* Brand Manifesto & Newsletter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              className="brand-logo footer-brand-logo"
              style={{
                fontSize: 'clamp(2.15rem, 2.7vw, 2.55rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '16px',
                lineHeight: 1,
                alignItems: 'baseline',
              }}
            >
              {settings?.storeName || 'CALZARE'}
            </div>
            <p style={{ color: '#a0a0a8', fontSize: '0.92rem', lineHeight: '1.65', margin: '0 0 12px 0', maxWidth: '380px' }}>
              {settings?.tagline || 'Good Shoes. Loud Personality.'} Sculpted from closed-cell waterproof EVA foam
              engineered to cradle human movement on pavement, rain, and trails.
            </p>

            {/* Quick footer email subscription positioned slightly bottom */}
            <div style={{ marginTop: '32px' }}>
              <form onSubmit={handleFooterSubscribe} style={{ display: 'flex', gap: '8px', maxWidth: '340px' }}>
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
                    padding: '9px 16px',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary btn-lime"
                  style={{ padding: '9px 16px', fontSize: '0.8rem' }}
                  disabled={subStatus.loading}
                >
                  {subStatus.success ? <CheckCircle size={15} /> : <ArrowRight size={15} />}
                </button>
              </form>
            </div>
          </div>

          {/* Column 1: Customer Care & Support (Middle Part) */}
          <div className="footer-col-middle">
            <div className="footer-col-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginBottom: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Care & Support
            </div>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {helpMenu.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.url}
                    className="footer-link"
                    style={{ color: '#a0a0a8', fontSize: '0.86rem', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a0a0a8')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Legal & Store Policies (Right Part) */}
          <div className="footer-col-right">
            <div className="footer-col-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginBottom: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Policies
            </div>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {policyMenu.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.url}
                    className="footer-link"
                    style={{ color: '#a0a0a8', fontSize: '0.86rem', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a0a0a8')}
                  >
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
