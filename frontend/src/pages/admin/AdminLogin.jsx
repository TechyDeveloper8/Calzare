import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, AlertCircle, Loader2, Lock, Mail } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@calzare.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      if (['superadmin', 'admin', 'product_manager', 'order_manager', 'editor'].includes(loggedUser.role)) {
        navigate('/admin');
      } else {
        setError('Access denied: Account does not have verified administrative permissions.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <div className="admin-login-card">
        {/* Corporate Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            CALZARE Control Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            Enterprise Management & Fulfillment Gateway
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Business Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="name@calzare.com"
              />
              <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="admin-form-group" style={{ marginBottom: '24px' }}>
            <label className="admin-label">Security Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="••••••••"
              />
              <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Sign In to Control Center'
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            color: '#64748b',
          }}
        >
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>Authorized Staff Access</div>
          <div>Admin: <code className="corp-code" style={{ fontSize: '0.72rem' }}>admin@calzare.com</code></div>
          <div style={{ marginTop: '2px' }}>Role-Based Access Control (RBAC) Enforced</div>
        </div>
      </div>
    </div>
  );
};
