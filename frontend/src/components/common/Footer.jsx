import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export const Footer = () => {
  const { settings, menus } = useStoreConfig();

  const shopMenu = menus?.footer_shop?.items || [
    { label: 'Cloud Hydro Clogs', url: '/shop?category=clogs' },
    { label: 'Aeroflex Sliders', url: '/shop?category=sliders' },
    { label: 'Kids Collection', url: '/kids' },
    { label: 'Unisex Collection', url: '/unisex' },
  ];

  const helpMenu = menus?.footer_help?.items || [
    { label: 'Size Guide', url: '/size-guide' },
    { label: 'Track My Order', url: '/track-order' },
    { label: 'Shipping & Delivery', url: '/shipping' },
    { label: '7-Day Easy Exchange', url: '/returns' },
    { label: 'FAQs', url: '/faq' },
    { label: 'Contact Concierge', url: '/contact' },
  ];

  const aboutMenu = menus?.footer_about?.items || [
    { label: 'About CALZARE', url: '/about' },
    { label: 'The Journal', url: '/journal' },
    { label: 'Active Offers', url: '/offers' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms & Conditions', url: '/terms' },
  ];

  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Manifesto */}
          <div>
            <div className="brand-logo" style={{ color: '#ffffff', marginBottom: '16px' }}>
              {settings?.storeName || 'CALZARE'}
              <span className="brand-logo-dot"></span>
            </div>
            <p style={{ color: '#a0a0a8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {settings?.tagline || 'Good Shoes. Loud Personality.'} Sculpted from closed-cell waterproof EVA foam
              engineered to cradle human movement through real life streets.
            </p>
            <div style={{ display: 'flex', gap: '16px', color: '#a0a0a8', fontSize: '0.85rem' }}>
              <div>📍 Indiranagar, Bengaluru</div>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <div className="footer-col-title">Collection</div>
            <ul className="footer-links-list">
              {shopMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <div className="footer-col-title">Care & Support</div>
            <ul className="footer-links-list">
              {helpMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Brand & Legal */}
          <div>
            <div className="footer-col-title">Studio & Legal</div>
            <ul className="footer-links-list">
              {aboutMenu.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Trust & Copyright Bar */}
        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} {settings?.storeName || 'CALZARE Footwear Private Limited'}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> 100% Secure Checkout
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} /> 7-Day Doorstep Exchange
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} /> Express India Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
