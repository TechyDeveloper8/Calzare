import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isStaff } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // If already authenticated with staff permissions, redirect directly to admin panel
  useEffect(() => {
    if (user && isStaff) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [user, isStaff, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both administrative business email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email.trim(), password);

      if (['superadmin', 'admin', 'product_manager', 'order_manager', 'editor'].includes(loggedUser.role)) {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setError('Access Denied (403): Account lacks verified staff/administrative authorization.');
        setAttempts((prev) => prev + 1);
      }
    } catch (err) {
      setAttempts((prev) => prev + 1);
      setError(err.message || 'Authentication rejected. Verify administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@calzare.com');
    setPassword('Admin@123456');
    setError('');
  };

  return (
    <div className="admin-login-layout">
      <div className="admin-login-card">
        {/* Return to Storefront link */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft size={13} /> Back to Storefront
          </Link>
        </div>

        {/* Corporate Gateway Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            CALZARE Control Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            Zero Trust Administrative Gateway & Fulfillment Control
          </p>
        </div>

        {/* Security Alert / Error Notice */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45,
            }}
            role="alert"
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700 }}>Authentication Failure</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Warning after repeated failed attempts */}
        {attempts >= 2 && !error.includes('temporarily locked') && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>
              Security Notice: 5 consecutive failed attempts will trigger an automated 15-minute account lockout.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="admin-email">
              Business Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '36px' }}
                placeholder="staff@calzare.com"
              />
              <Mail
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password Field with Safe Eye Toggle */}
          <div className="admin-form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="admin-label" htmlFor="admin-password" style={{ margin: 0 }}>
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0,
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                placeholder="Enter authorized password"
              />
              <Lock
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.88rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Authenticating Credentials...
              </>
            ) : (
              'Authenticate & Access Control'
            )}
          </button>
        </form>

        {/* Dev / Demo Autofill Helper (Discrete action for testing) */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoCredentials}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            <KeyRound size={12} /> Auto-fill Demo Admin Credentials
          </button>
        </div>

        {/* Security Compliance Seal */}
        <div
          style={{
            marginTop: '20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            <CheckCircle2 size={13} color="#16a34a" /> Enterprise Security Protocol Active
          </div>
          <div style={{ lineHeight: 1.45 }}>
            All administrative access attempts are cryptographically verified, rate-limited, and recorded to an immutable tamper-evident audit ledger.
          </div>
        </div>
      </div>
    </div>
  );
};
