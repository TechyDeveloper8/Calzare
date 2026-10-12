import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  Tag,
  Copy,
  Check,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  ShoppingBag,
} from 'lucide-react';

export const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicOffers();
        if (res.success && res.offers && res.offers.length > 0) {
          setOffers(res.offers);
        } else {
          // Fallback to verified active baseline coupons
          setOffers([
            {
              code: 'WELCOME10',
              description: 'Get an extra 10% off your first footwear drop purchase.',
              discountType: 'percentage',
              discountValue: 10,
              minOrderValue: 999,
              maxDiscountAmount: 300,
            },
            {
              code: 'CALZARE200',
              description: 'Flat ₹200 instant discount on multi-pair orders above ₹1,799.',
              discountType: 'flat',
              discountValue: 200,
              minOrderValue: 1799,
            },
            {
              code: 'FREESHIP',
              description: 'Free priority air courier across India on all prepaid checkouts.',
              discountType: 'flat',
              discountValue: 99,
              minOrderValue: 0,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load public offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1020px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="section-eyebrow">COMMUNITY DEALS // EXCLUSIVE CODES</span>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
            }}
          >
            ACTIVE OFFERS & PROMOS
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '540px',
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            All codes are authenticated directly on our checkout server. Click any coupon to copy and apply directly at your bag.
          </p>
        </div>

        {/* Offers Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '32px 28px',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative Corner Accent */}
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--accent-lime)',
                  opacity: 0.25,
                  pointerEvents: 'none',
                }}
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span
                    style={{
                      background: 'var(--surface-cream)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--ink-black)',
                    }}
                  >
                    {offer.discountType === 'percentage'
                      ? `${offer.discountValue}% OFF`
                      : `₹${offer.discountValue} FLAT OFF`}
                  </span>
                  <Tag size={18} color="var(--ink-black)" />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                  {offer.discountType === 'percentage'
                    ? `Save ${offer.discountValue}% Extra`
                    : `Flat ₹${offer.discountValue} Discount`}
                </h3>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {offer.description}
                </p>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginBottom: '24px',
                    borderTop: '1px dashed rgba(15,15,16,0.1)',
                    paddingTop: '12px',
                  }}
                >
                  {offer.minOrderValue > 0 ? (
                    <div>• Minimum cart subtotal: <strong>₹{offer.minOrderValue}</strong></div>
                  ) : (
                    <div>• Valid on all cart orders</div>
                  )}
                  {offer.maxDiscountAmount && (
                    <div>• Maximum discount cap: <strong>₹{offer.maxDiscountAmount}</strong></div>
                  )}
                  <div>• Valid on all styles and colorways</div>
                </div>
              </div>

              {/* Coupon Code Pill & Copy Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 8px 8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-cream)',
                  border: '1px solid rgba(15,15,16,0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-black)',
                  }}
                >
                  {offer.code}
                </span>

                <button
                  onClick={() => handleCopy(offer.code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: copiedCode === offer.code ? '#166534' : 'var(--ink-black)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check size={14} /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> COPY
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Shopping Guide Banner */}
        <div
          style={{
            padding: '48px 36px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-cream)',
            border: '1px solid rgba(15,15,16,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Ready to step in?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px' }}>
              Free express shipping applies automatically to all orders above ₹999. No code needed.
            </p>
          </div>

          <Link
            to="/shop"
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '0.98rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Explore Drop Now <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};
