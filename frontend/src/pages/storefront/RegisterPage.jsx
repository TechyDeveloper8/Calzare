import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(name, email, password, phone);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '80px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 32px',
          borderRadius: 'var(--radius-xl)',
          background: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">NEW STRIDER</span>
          <h1 style={{ fontSize: '2rem', margin: '4px 0 8px' }}>CREATE ACCOUNT</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Join the club for fast checkout and drop announcements.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input"
              placeholder="e.g. Anurag Raj"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="you@domain.com"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="admin-input"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password * (Min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-lime"
            style={{ width: '100%', padding: '16px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'CREATE MY ACCOUNT'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 800, color: 'var(--ink-black)', textDecoration: 'underline' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
