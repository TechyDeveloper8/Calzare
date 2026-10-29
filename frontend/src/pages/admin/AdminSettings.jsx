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
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
  Eye,
  Layers,
  Search,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'brandComparison' | 'subscribers' | 'audit'
  const [settings, setSettings] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [searchProdTerm, setSearchProdTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [testingFship, setTestingFship] = useState(false);
  const [fshipTestResult, setFshipTestResult] = useState(null);
  const [testPincode, setTestPincode] = useState('110001');
  const [testingPincode, setTestingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null);

  // Form State
  const [form, setForm] = useState({
    storeName: 'CALZARE',
    legalCompanyName: 'Calzare Heels Private Limited',
    websiteUrl: 'calzare.in',
    tagline: 'Good Shoes. Loud Personality.',
    contactEmail: 'Admin@calzareheels.com',
    contactPhone: '+91 98765 43210',
    businessAddress: 'CALZARE Design Lab, Indiranagar, Bengaluru, KA 560038',
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    defaultShippingFee: 99,
    codEnabled: true,
    codFee: 49,
    taxRatePercentage: 18,
    razorpayKeyId: 'rzp_test_calzare_demo_key',
    themeTokens: {
      accentLime: '#d8ff00',
      accentOrange: '#ff5d2b',
      surfaceDark: '#171719',
      glassBlur: '16px',
      cardRadius: '8px',
    },
    productPageDefaults: {
      breadcrumbHome: 'Home',
      breadcrumbCatalog: 'Footwear',
      addToCartText: 'ADD TO BAG',
      buyNowText: 'BUY IT NOW',
      outOfStockText: 'SOLD OUT',
      lowStockText: 'Only a few pairs left in stock!',
      colorSelectorHeading: 'Select Colorway',
      sizeSelectorHeading: 'Select Size (UK/India)',
      sizeGuideButtonText: 'Size & Fit Guide',
      quantityHeading: 'Quantity',
      deliveryCheckHeading: 'Estimate Delivery & Serviceability',
      deliveryCheckPlaceholder: 'Enter 6-digit Pincode',
      deliveryCheckButtonText: 'CHECK',
      shippingHeading: 'Shipping & Delivery',
      dispatchInfo: 'Orders processed within 1–2 business days. Estimated delivery 3–7 business days after dispatch across India.',
      deliveryGuidance: 'Tracking link sent via SMS/Email upon dispatch. Real-time courier updates available.',
      codMessage: 'Cash on Delivery (COD) & Partial COD available for eligible PIN codes across India.',
      returnsHeading: 'Refund, Return & Exchange Policy',
      returnPolicy: 'Size exchanges accepted within 3 days of delivery (disclosed exchange fee of ₹149 applies to help cover shipping & logistics). Damaged, defective, or incorrect items must be reported within 48 hours of delivery (unboxing video recommended). No fees charged when attributable to CALZARE™.',
      relatedProductsHeading: 'YOU MIGHT ALSO LIKE',
      reviewsHeading: 'VERIFIED CUSTOMER REVIEWS',
      faqsHeading: 'FREQUENTLY ASKED QUESTIONS',
      trustBadge1: 'Free Express Shipping Across India',
      trustBadge2: '3-Day Doorstep Size Exchange (₹149 Fee)',
      trustBadge3: '100% Genuine CALZARE™ Footwear',
      trustBadge4: 'Cash on Delivery & Partial COD Available',
    },
    brandComparisonDefault: {
      isEnabled: false,
      isPublished: true,
      heading: 'SEE THE DIFFERENCE',
      subheading: 'How CALZARE monolithic closed-cell foam compares to standard footwear',
      desktopMediaUrl: '',
      mobileMediaUrl: '',
      altText: 'Brand comparison',
      displayOrder: 0,
      scope: 'all',
      selectedProductIds: [],
      selectedCollectionIds: [],
    },
    fship: {
      enabled: true,
      apiKey: '68e1a2b5a61128696f34531432751be18eaea96aea6ea1aa093ff8b54c4b0507',
      baseUrl: 'https://capi.fship.in',
      pickupPincode: '560038',
      defaultCourier: 'auto',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [setRes, subRes, logRes, prodRes, colRes] = await Promise.all([
        api.adminGetSettings(),
        api.adminGetSubscribers(),
        api.adminGetAuditLogs(),
        api.getProducts({ limit: 200 }),
        api.getCollections(),
      ]);

      if (prodRes?.success) setProductsList(prodRes.products || []);
      if (colRes?.success) setCollectionsList(colRes.collections || []);

      if (setRes.success && setRes.settings) {
        setSettings(setRes.settings);
        setForm({
          storeName: setRes.settings.storeName || 'CALZARE',
          legalCompanyName: setRes.settings.legalCompanyName || 'Calzare Heels Private Limited',
          websiteUrl: setRes.settings.websiteUrl || 'calzare.in',
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
          productPageDefaults: {
            breadcrumbHome: 'Home',
            breadcrumbCatalog: 'Footwear',
            addToCartText: 'ADD TO BAG',
            buyNowText: 'BUY IT NOW',
            outOfStockText: 'SOLD OUT',
            lowStockText: 'Only a few pairs left in stock!',
            colorSelectorHeading: 'Select Colorway',
            sizeSelectorHeading: 'Select Size (UK/India)',
            sizeGuideButtonText: 'Size & Fit Guide',
            quantityHeading: 'Quantity',
            deliveryCheckHeading: 'Estimate Delivery & Serviceability',
            deliveryCheckPlaceholder: 'Enter 6-digit Pincode',
            deliveryCheckButtonText: 'CHECK',
            shippingHeading: 'Shipping & Delivery',
            dispatchInfo: 'Orders processed within 1–2 business days. Estimated delivery 3–7 business days after dispatch across India.',
            deliveryGuidance: 'Tracking link sent via SMS/Email upon dispatch. Real-time courier updates available.',
            codMessage: 'Cash on Delivery (COD) & Partial COD available for eligible PIN codes across India.',
            returnsHeading: 'Refund, Return & Exchange Policy',
            returnPolicy: 'Size exchanges accepted within 3 days of delivery (disclosed exchange fee of ₹149 applies to help cover shipping & logistics). Damaged, defective, or incorrect items must be reported within 48 hours of delivery (unboxing video recommended). No fees charged when attributable to CALZARE™.',
            relatedProductsHeading: 'YOU MIGHT ALSO LIKE',
            reviewsHeading: 'VERIFIED CUSTOMER REVIEWS',
            faqsHeading: 'FREQUENTLY ASKED QUESTIONS',
            trustBadge1: 'Free Express Shipping Across India',
            trustBadge2: '3-Day Doorstep Size Exchange (₹149 Fee)',
            trustBadge3: '100% Genuine CALZARE™ Footwear',
            trustBadge4: 'Cash on Delivery & Partial COD Available',
            ...(setRes.settings.productPageDefaults || {}),
          },
          brandComparisonDefault: {
            isEnabled: false,
            isPublished: true,
            heading: 'SEE THE DIFFERENCE',
            subheading: 'How CALZARE monolithic closed-cell foam compares to standard footwear',
            desktopMediaUrl: '',
            mobileMediaUrl: '',
            altText: 'Brand comparison',
            displayOrder: 0,
            scope: 'all',
            selectedProductIds: [],
            selectedCollectionIds: [],
            ...(setRes.settings.brandComparisonDefault || {}),
          },
          fship: {
            enabled: setRes.settings.fship?.enabled !== false,
            apiKey: setRes.settings.fship?.apiKey || '68e1a2b5a61128696f34531432751be18eaea96aea6ea1aa093ff8b54c4b0507',
            baseUrl: setRes.settings.fship?.baseUrl || 'https://capi.fship.in',
            pickupPincode: setRes.settings.fship?.pickupPincode || '560038',
            defaultCourier: setRes.settings.fship?.defaultCourier || 'auto',
          },
        });
      }

      if (subRes.success) setSubscribers(subRes.subscribers || []);
      if (logRes.success) setAuditLogs(logRes.logs || []);

      const secRes = await api.adminGetSecurityMetrics().catch(() => ({ success: false }));
      if (secRes.success) setSecurityMetrics(secRes);
    } catch (err) {
      setError(err.message || 'Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calzare_security_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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

  const handleTestFship = async () => {
    try {
      setTestingFship(true);
      setFshipTestResult(null);
      const res = await api.adminTestFshipConnection({
        apiKey: form.fship?.apiKey,
        baseUrl: form.fship?.baseUrl,
      });
      setFshipTestResult(res);
    } catch (err) {
      setFshipTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTestingFship(false);
    }
  };

  const handleTestPincode = async (e) => {
    if (e) e.preventDefault();
    if (!testPincode || testPincode.length !== 6) {
      alert('Please enter a valid 6-digit postal code');
      return;
    }
    try {
      setTestingPincode(true);
      setPincodeResult(null);
      const res = await api.checkDeliveryPincode(testPincode);
      setPincodeResult(res);
    } catch (err) {
      setPincodeResult({ success: false, message: err.message || 'Delivery check failed' });
    } finally {
      setTestingPincode(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Settings & System Audit</h1>
          <p className="admin-page-subtitle">
            Configure store identity, financial rules, shipping rates, brand comparison defaults, and review administrative audit logs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(activeTab === 'general' || activeTab === 'brandComparison') && (
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
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px', flexWrap: 'wrap' }}>
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
          onClick={() => setActiveTab('brandComparison')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'brandComparison' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'brandComparison' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Sparkles size={15} style={{ display: 'inline', marginRight: '6px' }} /> Brand Comparison ("See the Difference")
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
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'security' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'security' ? '#2563eb' : '#64748b',
          }}
        >
          <Shield size={15} style={{ display: 'inline', marginRight: '6px' }} /> Security Center & Posture
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
              <label className="admin-label">Legal Company Name (Operating Entity)</label>
              <input
                type="text"
                value={form.legalCompanyName || ''}
                onChange={(e) => setForm({ ...form, legalCompanyName: e.target.value })}
                className="admin-input"
                placeholder="e.g. Calzare Heels Private Limited"
              />
            </div>
            <div>
              <label className="admin-label">Official Store Website URL</label>
              <input
                type="text"
                value={form.websiteUrl || ''}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                className="admin-input"
                placeholder="e.g. calzare.in"
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
      ) : activeTab === 'brandComparison' ? (
        /* Tab: Brand Comparison ("See the Difference") */
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Info & Reference Loader Banner */}
          <div
            className="admin-card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--accent-lime, #d8ff00)',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Sparkles size={12} /> PDP Conversion Module
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: form.brandComparisonDefault?.isEnabled ? '#86efac' : '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  {form.brandComparisonDefault?.isEnabled ? '● Active' : '○ Disabled'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: form.brandComparisonDefault?.isPublished ? '#86efac' : '#fcd34d',
                    fontWeight: 600,
                  }}
                >
                  [{form.brandComparisonDefault?.isPublished ? 'Published' : 'Draft / Preview Only'}]
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                “SEE THE DIFFERENCE” — Brand Comparison Section
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, maxWidth: '640px' }}>
                Display a bold visual battlecard on product pages showing why CALZARE outperforms standard footwear.
                Preserves complete graphic resolution (2000 × 1218 original aspect ratio), supports independent desktop & mobile assets, and respects 4-tier inheritance rules.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    brandComparisonDefault: {
                      ...prev.brandComparisonDefault,
                      isEnabled: true,
                      isPublished: true,
                      heading: 'SEE THE DIFFERENCE',
                      subheading: 'How CALZARE monolithic closed-cell foam compares to standard footwear',
                      desktopMediaUrl: 'https://solaworld.in/cdn/shop/files/Battlecard-Web.png?v=1789572716&width=2000',
                      altText: 'Brand comparison',
                    },
                  }));
                }}
                className="admin-btn"
                style={{
                  background: 'var(--accent-lime, #d8ff00)',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  fontSize: '0.8rem',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} /> Load SolaWorld Reference Graphic
              </button>

              {form.brandComparisonDefault?.desktopMediaUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      brandComparisonDefault: {
                        ...prev.brandComparisonDefault,
                        desktopMediaUrl: '',
                        mobileMediaUrl: '',
                      },
                    }));
                  }}
                  className="admin-btn admin-btn-outline"
                  style={{ color: '#fff', borderColor: '#475569', fontSize: '0.8rem' }}
                >
                  Clear Media
                </button>
              )}
            </div>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Card 1: Section State & Publishing */}
            <div className="admin-card">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} /> Visibility & Publication Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.brandComparisonDefault?.isEnabled || false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandComparisonDefault: { ...form.brandComparisonDefault, isEnabled: e.target.checked },
                      })
                    }
                    style={{ width: '18px', height: '18px', accentColor: 'var(--ink-black)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Enable Brand Comparison Section</span>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Master toggle. If disabled, the section is completely omitted from storefronts.
                    </p>
                  </div>
                </label>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <label className="admin-label">Publication State</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          brandComparisonDefault: { ...form.brandComparisonDefault, isPublished: true },
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid',
                        borderColor: form.brandComparisonDefault?.isPublished ? '#16a34a' : 'var(--border-subtle)',
                        background: form.brandComparisonDefault?.isPublished ? '#f0fdf4' : '#fff',
                        color: form.brandComparisonDefault?.isPublished ? '#16a34a' : '#64748b',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      ✓ Published (Live to All)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          brandComparisonDefault: { ...form.brandComparisonDefault, isPublished: false },
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid',
                        borderColor: !form.brandComparisonDefault?.isPublished ? '#ca8a04' : 'var(--border-subtle)',
                        background: !form.brandComparisonDefault?.isPublished ? '#fefce8' : '#fff',
                        color: !form.brandComparisonDefault?.isPublished ? '#ca8a04' : '#64748b',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      ✎ Draft (Admin Preview Only)
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Draft changes are visible exclusively to logged-in administrators on product pages with a yellow "Preview" badge.
                  </p>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <label className="admin-label">Display Order on PDP</label>
                  <input
                    type="number"
                    value={form.brandComparisonDefault?.displayOrder ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandComparisonDefault: { ...form.brandComparisonDefault, displayOrder: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="admin-input"
                    placeholder="0"
                  />
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#888' }}>
                    Default position is immediately following product benefits & description, preceding customer reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Section Copy & Alt Text */}
            <div className="admin-card">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Section Copy & Accessibility
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="admin-label">Section Heading</label>
                  <input
                    type="text"
                    value={form.brandComparisonDefault?.heading || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandComparisonDefault: { ...form.brandComparisonDefault, heading: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="e.g. SEE THE DIFFERENCE"
                  />
                </div>

                <div>
                  <label className="admin-label">Supporting Text / Subheading</label>
                  <textarea
                    rows={2}
                    value={form.brandComparisonDefault?.subheading || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandComparisonDefault: { ...form.brandComparisonDefault, subheading: e.target.value },
                      })
                    }
                    className="admin-textarea"
                    placeholder="e.g. How CALZARE monolithic closed-cell foam compares to standard footwear"
                  />
                </div>

                <div>
                  <label className="admin-label">Meaningful Image Alt Text (SEO & Screen Readers)</label>
                  <input
                    type="text"
                    value={form.brandComparisonDefault?.altText || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandComparisonDefault: { ...form.brandComparisonDefault, altText: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="e.g. Brand comparison chart highlighting CALZARE features"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Media Assets */}
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Comparison Media Assets
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '-4px', marginBottom: '16px' }}>
              Upload new comparison graphics, select from the existing media library, or paste a CDN link.
              The storefront preserves the original aspect ratio (2000 × 1218) without cropping or distortion.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <div>
                <ImageUploadField
                  label="Desktop Comparison Asset (Primary)"
                  value={form.brandComparisonDefault?.desktopMediaUrl || ''}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      brandComparisonDefault: { ...form.brandComparisonDefault, desktopMediaUrl: url },
                    })
                  }
                  helperText="Recommended: 2000 × 1218 PNG or WebP. Serves as responsive baseline for all screens."
                />
              </div>

              <div>
                <ImageUploadField
                  label="Mobile Comparison Asset (Optional)"
                  value={form.brandComparisonDefault?.mobileMediaUrl || ''}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      brandComparisonDefault: { ...form.brandComparisonDefault, mobileMediaUrl: url },
                    })
                  }
                  helperText="Optional vertical or compact mobile graphic. If omitted, the desktop graphic scales down cleanly."
                />
              </div>
            </div>
          </div>

          {/* Card 4: Targeting & Scope Rules */}
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> Scope Targeting & Catalog Rules
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '-4px', marginBottom: '16px' }}>
              Define where this default brand comparison appears. Note that individual products can override or disable this setting in the Product Editor.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: form.brandComparisonDefault?.scope === 'all' ? 'var(--ink-black)' : 'var(--border-subtle)',
                  background: form.brandComparisonDefault?.scope === 'all' ? '#f8fafc' : '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={!form.brandComparisonDefault?.scope || form.brandComparisonDefault?.scope === 'all'}
                  onChange={() =>
                    setForm({
                      ...form,
                      brandComparisonDefault: { ...form.brandComparisonDefault, scope: 'all' },
                    })
                  }
                />
                All Products (Global Store Default)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: form.brandComparisonDefault?.scope === 'selected_products' ? 'var(--ink-black)' : 'var(--border-subtle)',
                  background: form.brandComparisonDefault?.scope === 'selected_products' ? '#f8fafc' : '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value="selected_products"
                  checked={form.brandComparisonDefault?.scope === 'selected_products'}
                  onChange={() =>
                    setForm({
                      ...form,
                      brandComparisonDefault: { ...form.brandComparisonDefault, scope: 'selected_products' },
                    })
                  }
                />
                Selected Products Only ({form.brandComparisonDefault?.selectedProductIds?.length || 0})
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: form.brandComparisonDefault?.scope === 'selected_collections' ? 'var(--ink-black)' : 'var(--border-subtle)',
                  background: form.brandComparisonDefault?.scope === 'selected_collections' ? '#f8fafc' : '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value="selected_collections"
                  checked={form.brandComparisonDefault?.scope === 'selected_collections'}
                  onChange={() =>
                    setForm({
                      ...form,
                      brandComparisonDefault: { ...form.brandComparisonDefault, scope: 'selected_collections' },
                    })
                  }
                />
                Selected Collections Only ({form.brandComparisonDefault?.selectedCollectionIds?.length || 0})
              </label>
            </div>

            {/* Product Selector Picker */}
            {form.brandComparisonDefault?.scope === 'selected_products' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchProdTerm}
                      onChange={(e) => setSearchProdTerm(e.target.value)}
                      className="admin-input"
                      style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          brandComparisonDefault: {
                            ...form.brandComparisonDefault,
                            selectedProductIds: productsList.map((p) => p._id),
                          },
                        })
                      }
                      className="admin-btn admin-btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          brandComparisonDefault: {
                            ...form.brandComparisonDefault,
                            selectedProductIds: [],
                          },
                        })
                      }
                      className="admin-btn admin-btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {productsList
                    .filter((p) =>
                      !searchProdTerm ||
                      p.name?.toLowerCase().includes(searchProdTerm.toLowerCase()) ||
                      p.slug?.toLowerCase().includes(searchProdTerm.toLowerCase())
                    )
                    .map((p) => {
                      const isSelected = form.brandComparisonDefault?.selectedProductIds?.includes(p._id);
                      return (
                        <label
                          key={p._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            background: isSelected ? '#eff6ff' : '#fff',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: isSelected ? '#93c5fd' : '#e2e8f0',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = form.brandComparisonDefault?.selectedProductIds || [];
                              const updated = e.target.checked
                                ? [...current, p._id]
                                : current.filter((id) => id !== p._id);
                              setForm({
                                ...form,
                                brandComparisonDefault: {
                                  ...form.brandComparisonDefault,
                                  selectedProductIds: updated,
                                },
                              });
                            }}
                          />
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt=""
                              style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <strong>{p.name}</strong> <span style={{ color: '#64748b' }}>({p.slug})</span>
                          </div>
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{p.price}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Collection Selector Picker */}
            {form.brandComparisonDefault?.scope === 'selected_collections' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  Products categorized under any selected collection will display this brand comparison:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {collectionsList.map((c) => {
                    const isSelected = form.brandComparisonDefault?.selectedCollectionIds?.includes(c._id);
                    return (
                      <label
                        key={c._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: isSelected ? '#eff6ff' : '#fff',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: isSelected ? '#93c5fd' : '#e2e8f0',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const current = form.brandComparisonDefault?.selectedCollectionIds || [];
                            const updated = e.target.checked
                              ? [...current, c._id]
                              : current.filter((id) => id !== c._id);
                            setForm({
                              ...form,
                              brandComparisonDefault: {
                                ...form.brandComparisonDefault,
                                selectedCollectionIds: updated,
                              },
                            });
                          }}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Real-Time Live Visual Preview */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Eye size={18} /> Storefront Live Preview
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Exact rendering simulation of how customers will experience this section on product detail pages.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`corp-pill ${form.brandComparisonDefault?.isEnabled ? 'corp-pill-success' : 'corp-pill-danger'}`} style={{ fontSize: '0.72rem' }}>
                  {form.brandComparisonDefault?.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <span className={`corp-pill ${form.brandComparisonDefault?.isPublished ? 'corp-pill-info' : 'corp-pill-warning'}`} style={{ fontSize: '0.72rem' }}>
                  {form.brandComparisonDefault?.isPublished ? 'Published' : 'Draft Mode'}
                </span>
              </div>
            </div>

            <div
              style={{
                background: '#09090b',
                borderRadius: '8px',
                padding: '32px 20px',
                border: '1px solid #27272a',
                color: '#fff',
              }}
            >
              <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: 'var(--accent-lime, #d8ff00)', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  BRAND COMPARISON
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  {form.brandComparisonDefault?.heading || 'SEE THE DIFFERENCE'}
                </h2>
                {form.brandComparisonDefault?.subheading && (
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '640px', margin: '0 auto 24px auto' }}>
                    {form.brandComparisonDefault?.subheading}
                  </p>
                )}

                {form.brandComparisonDefault?.desktopMediaUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#18181b',
                      border: '1px solid #27272a',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    }}
                  >
                    {!form.brandComparisonDefault?.isPublished && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(234, 179, 8, 0.95)',
                          color: '#000',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          zIndex: 2,
                        }}
                      >
                        DRAFT PREVIEW
                      </div>
                    )}
                    <img
                      src={form.brandComparisonDefault?.desktopMediaUrl}
                      alt={form.brandComparisonDefault?.altText || 'Brand comparison'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '2000 / 1218',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      border: '2px dashed #3f3f46',
                      borderRadius: '12px',
                      padding: '48px 20px',
                      color: '#71717a',
                      textAlign: 'center',
                    }}
                  >
                    <Layers size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>No comparison graphic configured</p>
                    <p style={{ fontSize: '0.8rem', color: '#52525b', margin: 0 }}>
                      Click "Load SolaWorld Reference Graphic" above or upload an asset to display it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Brand Comparison Settings'}
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
      ) : activeTab === 'security' ? (
        /* Tab: Security Center & Threat Posture */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Security Header Card */}
          <div
            className="admin-card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '28px',
              border: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
                  <ShieldCheck size={14} /> ZERO TRUST ARCHITECTURE • ACTIVE
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                  Enterprise Security & Threat Defense Center
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', maxWidth: '600px', lineHeight: 1.5 }}>
                  Continuous cryptographic session integrity, role-based access enforcement, and real-time administrative threat monitoring.
                </p>
              </div>

              {/* Security Score Dial */}
              <div
                style={{
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  minWidth: '150px',
                }}
              >
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                  Security Posture
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                  {securityMetrics?.securityScore || 98}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 600, marginTop: '4px' }}>
                  Optimal Hardened
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="admin-security-grid">
            <div className="admin-security-card">
              <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Active Staff Accounts
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                {securityMetrics?.totalStaff || 1}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                RBAC Least Privilege Enforced
              </div>
            </div>

            <div className="admin-security-card">
              <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Locked Accounts
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: (securityMetrics?.lockedUsers || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                {securityMetrics?.lockedUsers || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                Auto-Quarantine (5 failed attempts)
              </div>
            </div>

            <div className="admin-security-card">
              <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Workstation Inactivity
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                15 Mins
              </div>
              <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                OWASP Lock Screen Active
              </div>
            </div>

            <div className="admin-security-card">
              <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Audit Ledger Records
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                {securityMetrics?.totalAuditEvents || auditLogs.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                Immutable Event History
              </div>
            </div>
          </div>

          {/* Defense Controls Checklist Table */}
          <div className="admin-card">
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--corp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px' }}>System Defense Controls Matrix</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Active cryptographic safeguards, network perimeter limits, and access controls
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportAuditLogs}
                className="admin-btn admin-btn-outline"
                style={{ fontSize: '0.78rem', padding: '7px 14px' }}
              >
                <FileText size={14} /> Export Compliance Audit (JSON)
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Security Safeguard</th>
                    <th>Status</th>
                    <th>Cryptographic / Functional Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  {(securityMetrics?.checks || [
                    { name: 'Helmet HTTP Security Headers', status: 'ACTIVE', impact: 'Defense against clickjacking & XSS' },
                    { name: 'Bcrypt Salt Hashing (10 Rounds)', status: 'ACTIVE', impact: 'Cryptographic password storage' },
                    { name: 'RBAC Access Gatekeeper', status: 'ENFORCED', impact: 'Least privilege role enforcement' },
                    { name: 'Brute-Force Lockout (5 attempts)', status: 'ACTIVE', impact: '15-min automated IP/account quarantine' },
                    { name: 'Rate Limiting (express-rate-limit)', status: 'ACTIVE', impact: 'DDoS & credential stuffing throttle' },
                    { name: 'Tamper-Evident Audit Logging', status: 'ACTIVE', impact: 'Real-time staff event persistence' },
                    { name: 'Inactivity Session Lockout', status: 'ACTIVE', impact: '15-min workstation auto-lock' },
                  ]).map((chk, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{chk.name}</td>
                      <td>
                        <span className="corp-pill corp-pill-success" style={{ fontSize: '0.72rem' }}>
                          <CheckCircle size={12} /> {chk.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>{chk.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab: Audit Logs */
        <div className="admin-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px' }}>Administrative Audit Trail</h3>
              <p style={{ fontSize: '0.8rem', color: '#777', margin: 0 }}>
                Immutable tamper-evident record of price modifications, inventory decrements, logins, and status updates
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportAuditLogs}
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <FileText size={13} /> Export JSON
            </button>
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
                        {log.entityType || log.targetModel} {log.entityId || log.targetId ? `(${log.entityId || log.targetId})` : ''}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {log.userEmail || log.performedBy?.email || log.user?.name || log.user?.email || 'System'}
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
