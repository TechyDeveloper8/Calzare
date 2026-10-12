import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Droplets,
  Ruler,
  Truck,
  RotateCcw,
  CreditCard,
  MessageSquare,
} from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'sizing',
    categoryLabel: 'Sizing & Fit',
    question: 'How do CALZARE sizes fit compared to standard sneakers?',
    answer:
      'CALZARE silhouettes fit true to standard UK / Indian footwear sizing. Our ergonomic footbeds are molded with anatomical arch contours and generous toe boxes. If you have wide feet or plan to style your clogs with thick knit socks, we recommend choosing the next size up (e.g. if you are UK 7.5, select UK 8).',
  },
  {
    category: 'sizing',
    categoryLabel: 'Sizing & Fit',
    question: 'What if the size I ordered does not fit?',
    answer:
      'No stress at all. We provide a 100% free 7-day doorstep size swap. Our courier partner brings your replacement size directly to your address and collects the previous pair at the same time.',
  },
  {
    category: 'care',
    categoryLabel: 'Waterproof EVA Care',
    question: 'Are CALZARE clogs and slides completely waterproof?',
    answer:
      'Yes, 100%. Our monolithic footwear is injection molded from supercritical closed-cell EVA polymer. The microscopic cell walls are non-porous, meaning water, mud, street grime, and sweat cannot penetrate the material. They will never absorb unpleasant odors.',
  },
  {
    category: 'care',
    categoryLabel: 'Waterproof EVA Care',
    question: 'How do I clean and care for my footwear?',
    answer:
      'Simply rinse with cold or lukewarm tap water and mild dish soap using a soft sponge or cloth. They air-dry completely in under 10 minutes. Important: Never leave EVA footwear inside a hot enclosed car trunk or under boiling direct midday sun on a hot balcony for days, as extreme trapped heat (above 65°C) can cause EVA foam shrinkage.',
  },
  {
    category: 'shipping',
    categoryLabel: 'Shipping & Dispatch',
    question: 'How fast is delivery across India?',
    answer:
      'All orders are processed and handed to priority air couriers (BlueDart, Delhivery, XpressBees) within 24 hours. Metro cities (Bengaluru, Mumbai, Delhi NCR, Chennai, Hyderabad, Kolkata) arrive in 2 to 3 business days. Rest of India typically arrives in 3 to 5 business days.',
  },
  {
    category: 'shipping',
    categoryLabel: 'Shipping & Dispatch',
    question: 'Is shipping free?',
    answer:
      'Yes! We offer 100% FREE express shipping on all orders above ₹999. For orders below ₹999, a nominal flat convenience shipping fee of ₹99 applies.',
  },
  {
    category: 'returns',
    categoryLabel: '7-Day Doorstep Exchanges',
    question: 'How do I initiate a size exchange or return?',
    answer:
      'You can request a doorstep swap within 7 days of delivery through your Customer Account order history or by dropping our Concierge a quick WhatsApp message with your Order ID. Footwear must be unworn outdoors with tags attached.',
  },
  {
    category: 'returns',
    categoryLabel: '7-Day Doorstep Exchanges',
    question: 'How do refunds work for returned items?',
    answer:
      'Once the pair passes quality check at our warehouse, prepaid payments are refunded to the original payment source within 24 hours (reflecting in 3-5 bank business days). COD orders are refunded via direct UPI transfer or NEFT.',
  },
  {
    category: 'payments',
    categoryLabel: 'Payments & COD',
    question: 'What payment options do you support?',
    answer:
      'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), NetBanking across 50+ banks, and Cash on Delivery (COD) across 18,000+ pin codes in India.',
  },
  {
    category: 'payments',
    categoryLabel: 'Payments & COD',
    question: 'Is online payment secure on CALZARE?',
    answer:
      'Absolutely. All payments are encrypted through Razorpay’s PCI-DSS Level 1 certified gateway. We never store or view your credit card details or bank passwords.',
  },
];

export const FaqPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'All FAQs' },
    { id: 'sizing', label: 'Sizing & Fit' },
    { id: 'care', label: 'EVA Care & Water' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'returns', label: 'Doorstep Exchanges' },
    { id: 'payments', label: 'Payments & COD' },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="section-eyebrow">KNOWLEDGE BASE // COMMON INQUIRIES</span>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
            }}
          >
            FREQUENTLY ASKED
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            Everything you need to know about closed-cell foam sizing, monsoon care, door-to-door swaps, and shipping.
          </p>

          {/* Search Input */}
          <div
            style={{
              maxWidth: '480px',
              margin: '28px auto 0',
              position: 'relative',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search e.g. sizing, waterproof, exchange..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: '999px',
                border: '1px solid rgba(15,15,16,0.15)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '36px',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeCategory === cat.id ? 'var(--ink-black)' : 'rgba(15,15,16,0.1)',
                background: activeCategory === cat.id ? 'var(--ink-black)' : '#ffffff',
                color: activeCategory === cat.id ? '#ffffff' : 'var(--ink-black)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFaqs.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: 'var(--radius-lg)',
                background: '#ffffff',
              }}
            >
              <HelpCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3>No matching questions found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Try another keyword or reach out directly to our support team.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    background: '#ffffff',
                    overflow: 'hidden',
                    border: '1px solid rgba(15,15,16,0.08)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {faq.categoryLabel}
                      </span>
                      <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-black)' }}>
                        {faq.question}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOpen ? 'var(--ink-black)' : 'var(--surface-cream)',
                        color: isOpen ? '#ffffff' : 'var(--ink-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 22px',
                        fontSize: '0.94rem',
                        lineHeight: 1.7,
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid rgba(15,15,16,0.04)',
                        paddingTop: '16px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Need Help Box */}
        <div
          style={{
            marginTop: '56px',
            padding: '36px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-cream)',
            border: '1px solid rgba(15,15,16,0.08)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Didn’t find your answer?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            Our concierge team is standing by to help with foot measurements, custom orders, or courier checks.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.92rem' }}>
              Message Concierge
            </Link>
            <Link to="/size-guide" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.92rem' }}>
              View Sizing Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
