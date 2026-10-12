import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/api.js';

export const NewsletterSection = ({ section }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ loading: false, success: false, message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setStatus({ loading: true, success: false, message: '' });
      const res = await api.subscribeNewsletter({ email, source: 'homepage_module' });
      setStatus({ loading: false, success: true, message: res.message || 'Welcome to the CALZARE VIP Circle!' });
      setEmail('');
    } catch (err) {
      setStatus({ loading: false, success: false, message: err.message || 'Subscription failed. Please try again.' });
    }
  };

  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <div className="newsletter-box">
          {section.eyebrow && (
            <span className="badge-lime" style={{ marginBottom: '16px' }}>
              {section.eyebrow}
            </span>
          )}
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#ffffff', marginBottom: '16px' }}>
            {section.title || 'DON’T MISS THE NEXT DROP.'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '540px', margin: '0 auto', fontSize: '1.05rem' }}>
            {section.subtitle ||
              'Sign up for early drop notifications, secret colorways, and VIP discount access. No spam, ever.'}
          </p>

          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button
              type="submit"
              className="btn-primary btn-lime"
              style={{ padding: '10px 24px', fontSize: '0.82rem' }}
              disabled={status.loading}
            >
              {status.loading ? <Loader2 size={16} className="animate-spin" /> : <>JOIN DROP <ArrowRight size={16} /></>}
            </button>
          </form>

          {status.message && (
            <div
              style={{
                marginTop: '16px',
                fontSize: '0.85rem',
                color: status.success ? 'var(--accent-lime)' : '#ff6b6b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {status.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
