import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Settings,
  Palette,
  Mail,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Truck,
  CreditCard,
  Sliders,
  History,
} from 'lucide-react';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'theme' | 'subscribers' | 'audit'
  const [settings, setSettings] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    storeName: 'CALZARE',
    tagline: 'Sculptural Footwear & Unconventional Street Styles',
    contactEmail: 'support@calzare.com',
    contactPhone: '+91 98765 43210',
    businessAddress: 'Sector 62, Innovation Hub, Noida, UP, India',
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    defaultShippingFee: 99,
    codEnabled: true,
    codFee: 49,
    taxRatePercentage: 5,
    razorpayKeyId: 'rzp_test_calzare_demo_key',
    themeTokens: {
      accentLime: '#d8ff00',
      accentOrange: '#ff5d2b',
      surfaceDark: '#171719',
      glassBlur: '16px',
      cardRadius: '8px',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [setRes, subRes, logRes] = await Promise.all([
        api.adminGetSettings(),
        api.adminGetSubscribers(),
        api.adminGetAuditLogs(),
      ]);

      if (setRes.success && setRes.settings) {
        setSettings(setRes.settings);
        setForm({
          storeName: setRes.settings.storeName || 'CALZARE',
          tagline: setRes.settings.tagline || '',
          contactEmail: setRes.settings.contactEmail || '',
          contactPhone: setRes.settings.contactPhone || '',
          businessAddress: setRes.settings.businessAddress || '',
          currency: setRes.settings.currency || 'INR',
          currencySymbol: setRes.settings.currencySymbol || '₹',
          freeShippingThreshold: setRes.settings.freeShippingThreshold ?? 999,
          defaultShippingFee: setRes.settings.defaultShippingFee ?? 99,
          codEnabled: setRes.settings.codEnabled !== false,
          codFee: setRes.settings.codFee ?? 49,
          taxRatePercentage: setRes.settings.taxRatePercentage ?? 5,
          razorpayKeyId: setRes.settings.razorpayKeyId || '',
          themeTokens: {
            accentLime: setRes.settings.themeTokens?.accentLime || '#d8ff00',
            accentOrange: setRes.settings.themeTokens?.accentOrange || '#ff5d2b',
            surfaceDark: setRes.settings.themeTokens?.surfaceDark || '#171719',
            glassBlur: setRes.settings.themeTokens?.glassBlur || '16px',
            cardRadius: setRes.settings.themeTokens?.cardRadius || '8px',
          },
        });
      }

      if (subRes.success) setSubscribers(subRes.subscribers || []);
      if (logRes.success) setAuditLogs(logRes.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await api.adminUpdateSettings(form);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Settings & System Audit</h1>
          <p className="admin-page-subtitle">
            Configure financial rules, shipping rates, creative theme tokens, and review administrative audit logs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(activeTab === 'general' || activeTab === 'theme') && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ gap: '6px' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Store configuration updated and applied live!
        </div>
      )}

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'general' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Settings size={15} style={{ display: 'inline', marginRight: '6px' }} /> General & Financial
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'theme' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'theme' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Palette size={15} style={{ display: 'inline', marginRight: '6px' }} /> Creative Theme Tokens
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'subscribers' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'subscribers' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Mail size={15} style={{ display: 'inline', marginRight: '6px' }} /> Newsletter Club ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'audit' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--ink-black)' : '#888',
          }}
        >
          <History size={15} style={{ display: 'inline', marginRight: '6px' }} /> System Audit Logs
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading store configuration...</div>
      ) : activeTab === 'general' ? (
        /* Tab 1: General & Financial */
        <form onSubmit={handleSave} className="admin-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>Store Identity & Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="admin-label">Brand Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Brand Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Customer Support Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Support Helpline Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="admin-input"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">Registered Business Address</label>
              <input
                type="text"
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            Shipping, Taxes & Checkout Rules
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="admin-label">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                className="admin-input"
              />
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Orders above this qualify for free shipping</span>
            </div>
            <div>
              <label className="admin-label">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={form.defaultShippingFee}
                onChange={(e) => setForm({ ...form, defaultShippingFee: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Footwear GST Rate (%)</label>
              <input
                type="number"
                value={form.taxRatePercentage}
                onChange={(e) => setForm({ ...form, taxRatePercentage: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">COD Convenience Fee (₹)</label>
              <input
                type="number"
                value={form.codFee}
                onChange={(e) => setForm({ ...form, codFee: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={form.codEnabled}
                onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })}
              />
              Enable Cash on Delivery (COD) nationwide across India
            </label>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            Payment Gateway (Razorpay)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="admin-label">Razorpay Key ID (Client-side)</label>
              <input
                type="text"
                value={form.razorpayKeyId}
                onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </form>
      ) : activeTab === 'theme' ? (
        /* Tab 2: Theme Tokens */
        <form onSubmit={handleSave} className="admin-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>Creative Visual Tokens</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
            Adjust the brand palette tokens without breaking accessible contrast or requiring codebase rebuilds
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label className="admin-label">Electric Lime Accent</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.themeTokens.accentLime}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, accentLime: e.target.value } })}
                  style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={form.themeTokens.accentLime}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, accentLime: e.target.value } })}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Tangerine Orange Accent</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.themeTokens.accentOrange}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, accentOrange: e.target.value } })}
                  style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={form.themeTokens.accentOrange}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, accentOrange: e.target.value } })}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Dark Ink Surface</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.themeTokens.surfaceDark}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, surfaceDark: e.target.value } })}
                  style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={form.themeTokens.surfaceDark}
                  onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, surfaceDark: e.target.value } })}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Glassmorphism Backdrop Blur</label>
              <select
                value={form.themeTokens.glassBlur}
                onChange={(e) => setForm({ ...form, themeTokens: { ...form.themeTokens, glassBlur: e.target.value } })}
                className="admin-select"
              >
                <option value="8px">8px (Light Subtlety)</option>
                <option value="16px">16px (Standard Refined)</option>
                <option value="24px">24px (Heavy Frosted)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Theme Tokens'}
            </button>
          </div>
        </form>
      ) : activeTab === 'subscribers' ? (
        /* Tab 3: Newsletter Subscribers */
        <div className="admin-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Newsletter Club Subscribers</h3>
              <p style={{ fontSize: '0.8rem', color: '#777' }}>Audience members who subscribed to new drop alerts</p>
            </div>
            <span className="corp-pill corp-pill-info" style={{ fontSize: '0.76rem', padding: '3px 10px' }}>
              {subscribers.length} Subscribers
            </span>
          </div>

          {subscribers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              No subscribers yet
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Subscribed On</th>
                    <th>Source Channel</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600 }}>{s.email}</td>
                      <td style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#777', textTransform: 'capitalize' }}>
                        {s.source || 'Footer Marquee'}
                      </td>
                      <td>
                        <span className="status-badge status-delivered">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tab 4: Audit Logs */
        <div className="admin-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Administrative Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: '#777' }}>
              Immutable record of price modifications, inventory decrements, and status updates
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              No audit logs recorded
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Target Resource</th>
                    <th>Staff User</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.8rem', color: '#555' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td>
                        <code className="corp-code" style={{ fontSize: '0.74rem' }}>
                          {log.action}
                        </code>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {log.targetModel} {log.targetId ? `(${log.targetId})` : ''}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {log.user?.name || log.user?.email || 'System'}
                      </td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#777' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
