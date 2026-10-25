import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';

export const NewsletterSection = ({ section }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ loading: false, success: false, message: 'Please enter a valid email address.' });
      return;
    }
    if (!consent) {
      setStatus({ loading: false, success: false, message: 'Please agree to the privacy policy to receive email updates.' });
      return;
    }

    try {
      setStatus({ loading: true, success: false, message: '' });
      const res = await api.subscribeNewsletter({ email, source: 'homepage_module' });
      setStatus({
        loading: false,
        success: true,
        message: res.message || 'You are now subscribed to the CALZARE Insider Circle!',
      });
      setEmail('');
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        message: err.message || 'Subscription failed. Please try again.',
      });
    }
  };

  return (
    <section style={{ padding: '60px 0 100px' }} aria-labelledby="newsletter-heading">
      <div className="container">
        <div
          className="newsletter-box"
          style={{
            backgroundColor: 'var(--ink-black)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 32px',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2
            id="newsletter-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: '#ffffff',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {section.title || 'DON’T MISS THE NEXT DROP.'}
          </h2>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              maxWidth: '540px',
              margin: '0 auto 28px',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {section.subtitle ||
              'Sign up for early colorway announcements, secret drops, and VIP discount access. No spam, ever.'}
          </p>

          <form
            onSubmit={handleSubmit}
            className="newsletter-form"
            style={{
              display: 'flex',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '12px 18px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className="btn-primary btn-lime"
              style={{ padding: '12px 24px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              disabled={status.loading}
            >
              {status.loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  JOIN DROP <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Consent Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ accentColor: 'var(--accent-lime)' }}
              />
              <span>
                I agree to the <Link to="/privacy" style={{ color: 'var(--accent-lime)', textDecoration: 'underline' }}>Privacy Policy</Link> and agree to receive updates.
              </span>
            </label>
          </div>

          {/* Feedback Messages */}
          {status.message && (
            <div
              style={{
                marginTop: '18px',
                fontSize: '0.85rem',
                color: status.success ? 'var(--accent-lime)' : '#fca5a5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: status.success ? 'rgba(216, 255, 0, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {status.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
