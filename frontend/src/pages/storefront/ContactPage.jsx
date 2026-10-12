import React, { useState } from 'react';
import { api } from '../../api/api.js';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    orderNumber: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, email address, and message.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.submitContactInquiry(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: 'general',
          orderNumber: '',
          subject: '',
          message: '',
        });
      } else {
        setErrorMsg(res.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error submitting support request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="section-eyebrow">CONCIERGE & SUPPORT // STUDIO HELPDESK</span>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
            }}
          >
            LET’S TALK STRIDES
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            Questions on fit, ongoing drops, or doorstep exchanges? Our product concierge team answers every message within 24 operational hours.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Direct Info & Channels */}
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Direct Channels</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--surface-cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} color="var(--ink-black)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Concierge Email
                    </div>
                    <a
                      href="mailto:concierge@calzarefootwear.com"
                      style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-black)', textDecoration: 'none' }}
                    >
                      concierge@calzarefootwear.com
                    </a>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Priority queue for orders and sizing questions
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--surface-cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={18} color="var(--ink-black)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      WhatsApp Helpline
                    </div>
                    <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-black)' }}>
                      +91 98765 43210
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Instant chat support during business hours
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--surface-cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={18} color="var(--ink-black)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Operating Hours
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>
                      Monday – Saturday // 10:00 AM – 7:00 PM IST
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--surface-cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={18} color="var(--ink-black)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Creative Design Studio
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038, India
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Quick Links */}
            <div
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface-cream)',
                border: '1px solid rgba(15,15,16,0.06)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>
                Need something right away?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <a href="/track-order" style={{ color: 'var(--ink-black)', textDecoration: 'underline' }}>
                  → Track your active parcel dispatch
                </a>
                <a href="/faq" style={{ color: 'var(--ink-black)', textDecoration: 'underline' }}>
                  → Browse common footwear FAQs & sizing
                </a>
                <a href="/returns" style={{ color: 'var(--ink-black)', textDecoration: 'underline' }}>
                  → 7-Day doorstep size exchange terms
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              borderRadius: 'var(--radius-xl)',
              background: '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Send an Inquiry</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
              We record every ticket directly into our CRM with an immutable reference ID.
            </p>

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  color: '#166534',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  marginBottom: '24px',
                }}
              >
                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#991b1b',
                  fontSize: '0.88rem',
                  marginBottom: '24px',
                }}
              >
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@domain.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order_status">Order Status & Dispatch</option>
                    <option value="sizing_fit">Sizing & Foot Measurement</option>
                    <option value="exchange_return">7-Day Doorstep Exchange</option>
                    <option value="product_inquiry">Product & Drop Info</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Order Number (If applicable)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    placeholder="CALZ-2026-..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(15,15,16,0.15)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can our concierge team assist your stride today?"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(15,15,16,0.15)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  'Transmitting to Studio...'
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
