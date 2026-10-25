import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  Check,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Eye,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField.jsx';

export const CollectionHeroStudioModal = ({
  isOpen,
  onClose,
  collection,
  collections = [],
  onSave,
  onSelectCollection,
}) => {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Working draft state for the active hero
  const [formData, setFormData] = useState({
    label: '',
    heading: '',
    supportingText: '',
    desktopBannerUrl: '',
    mobileBannerUrl: '',
    imagePosition: 'center center',
    background: 'editorial_minimal',
    ctaText: 'EXPLORE DROP',
    ctaLink: '#collection-grid',
    isVisible: true,
  });

  // Hydrate draft whenever the active collection changes
  useEffect(() => {
    if (collection) {
      const hero = collection.hero || {};
      const slug = (collection.slug || '').toLowerCase();

      // Determine sensible defaults if fields are not yet set
      const defaultLabel =
        slug === 'women'
          ? "THE WOMEN'S EDIT"
          : slug === 'kids'
          ? "THE KIDS' EDIT"
          : slug === 'unisex'
          ? "THE UNISEX EDIT"
          : "THE MEN'S EDIT";

      const defaultHeading =
        slug === 'women'
          ? 'EFFORTLESS REBOUND.'
          : slug === 'kids'
          ? 'BUILT FOR PLAY.'
          : slug === 'unisex'
          ? 'UNIVERSAL FORM. PURE FUNCTION.'
          : 'BUILT TO STAND OUT.';

      const defaultDesc =
        slug === 'women'
          ? 'No laces, no rush — comfort that clocks off exactly when you do.'
          : slug === 'kids'
          ? 'Featherlight, washable, and ultra-durable comfort for little explorers everywhere.'
          : slug === 'unisex'
          ? 'Sculpted footwear engineered for all identities, all terrains, and all-day ease.'
          : 'Everyday comfort. Zero ordinary energy.';

      const defaultImg =
        slug === 'women'
          ? '/images/split/women-collection-image.jpg'
          : slug === 'kids'
          ? '/images/split/kids-collection-image.jpg'
          : slug === 'unisex'
          ? '/images/split/unisex-collection-image.jpg'
          : '/images/split/men-collection-image.jpg';

      setFormData({
        label: hero.label !== undefined ? hero.label : defaultLabel,
        heading: hero.heading || defaultHeading,
        supportingText: hero.supportingText || defaultDesc,
        desktopBannerUrl: hero.desktopBannerUrl || defaultImg,
        mobileBannerUrl: hero.mobileBannerUrl || '',
        imagePosition: hero.imagePosition || 'center center',
        background: hero.background || 'editorial_minimal',
        ctaText: hero.ctaText || 'EXPLORE DROP',
        ctaLink: hero.ctaLink || '#collection-grid',
        isVisible: hero.isVisible !== false,
      });

      setError('');
      setSaveSuccess(false);
    }
  }, [collection]);

  if (!isOpen || !collection) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await onSave(collection._id, {
        hero: {
          label: formData.label,
          heading: formData.heading,
          supportingText: formData.supportingText,
          desktopBannerUrl: formData.desktopBannerUrl,
          mobileBannerUrl: formData.mobileBannerUrl,
          imagePosition: formData.imagePosition,
          background: formData.background,
          ctaText: formData.ctaText,
          ctaLink: formData.ctaLink,
          isVisible: formData.isVisible,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setError(err.message || 'Failed to save Hero Banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick switch pills for Women, Men, Kids, Unisex, and others
  const audienceSlugs = ['women', 'men', 'kids', 'unisex'];
  const audienceCollections = collections.filter((c) =>
    audienceSlugs.includes((c.slug || '').toLowerCase())
  );
  const otherCollections = collections.filter(
    (c) => !audienceSlugs.includes((c.slug || '').toLowerCase())
  );

  return (
    <div
      className="admin-modal-overlay"
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="admin-modal-box"
        style={{
          width: '94vw',
          maxWidth: '1240px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header & Quick Section Switcher ────────────────────────── */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(216, 255, 0, 0.15)',
                color: '#d8ff00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Collection Hero CMS Studio
                </h2>
                <span
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  /{collection.slug}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
                Live visual management of <code>.collection-hero__inner</code> for Kids, Men, Women & drops
              </p>
            </div>
          </div>

          {/* Quick Audience Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
              Switch Section:
            </span>
            {audienceCollections.map((col) => {
              const isSelected = col._id === collection._id;
              const slugLabel =
                col.slug === 'women'
                  ? "Women's"
                  : col.slug === 'men'
                  ? "Men's"
                  : col.slug === 'kids'
                  ? "Kids'"
                  : 'Unisex';
              return (
                <button
                  key={col._id}
                  type="button"
                  onClick={() => onSelectCollection && onSelectCollection(col)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #d8ff00' : '1px solid #334155',
                    backgroundColor: isSelected ? '#d8ff00' : '#1e293b',
                    color: isSelected ? '#0f172a' : '#cbd5e1',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {slugLabel}
                </button>
              );
            })}

            {otherCollections.length > 0 && (
              <select
                value={audienceSlugs.includes(collection.slug) ? '' : collection._id}
                onChange={(e) => {
                  const target = collections.find((c) => c._id === e.target.value);
                  if (target && onSelectCollection) onSelectCollection(target);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled>
                  More Collections...
                </option>
                {otherCollections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                marginLeft: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close CMS Studio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Status Banners (Save Success / Errors) ───────────────────────── */}
        {saveSuccess && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              borderBottom: '1px solid #a7f3d0',
              padding: '10px 24px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            Hero Banner for {collection.name} successfully published to storefront!
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderBottom: '1px solid #fecaca',
              padding: '10px 24px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} color="#dc2626" />
            {error}
          </div>
        )}

        {/* ── Modal Body: 2-Column Studio ──────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(380px, 1fr) minmax(420px, 1.25fr)',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* ── LEFT COLUMN: Form Controls & Media Upload ──────────────────── */}
          <div
            style={{
              padding: '24px',
              overflowY: 'auto',
              borderRight: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Visibility & Identity */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      Hero Banner Visibility
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Display this rich editorial split hero at the top of the collection page
                    </div>
                  </div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#0f172a' }}
                    />
                    <span>{formData.isVisible ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>
              </div>

              {/* Media / Image Upload */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ImageIcon size={16} /> Hero Media & Image Upload
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '14px' }}>
                  Upload the main visual for the right split panel (drag & drop, upload file, or use URL).
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <ImageUploadField
                    label="Desktop Hero Image"
                    description="Editorial banner (1600 × 600px or high-res vertical lifestyle crop recommended)"
                    value={formData.desktopBannerUrl}
                    onChange={(url) => setFormData({ ...formData, desktopBannerUrl: url })}
                    aspectRatio="banner"
                    compact={true}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <ImageUploadField
                    label="Mobile Hero Image (Optional)"
                    description="Alternate crop tailored for narrow portrait phone viewports"
                    value={formData.mobileBannerUrl}
                    onChange={(url) => setFormData({ ...formData, mobileBannerUrl: url })}
                    aspectRatio="square"
                    compact={true}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Image Focal Point / Object Position</label>
                  <select
                    value={formData.imagePosition}
                    onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value })}
                    className="admin-select"
                  >
                    <option value="center center">Center Middle (Default)</option>
                    <option value="center top">Center Top (Prioritize upper details)</option>
                    <option value="center bottom">Center Bottom (Prioritize lower details)</option>
                    <option value="left center">Left Center</option>
                    <option value="right center">Right Center</option>
                  </select>
                </div>
              </div>

              {/* Copy & Content Fields */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} /> Typography & Content
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '14px' }}>
                  Customize eyebrow badge, bold editorial headline, and supporting description.
                </div>

                <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                  <label className="admin-label">
                    Eyebrow / Label (with Sparkle Icon)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THE WOMEN'S EDIT"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="admin-input"
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Renders inside the rounded pill badge above the headline
                  </span>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                  <label className="admin-label">Hero Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EFFORTLESS REBOUND."
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    className="admin-input"
                    style={{ fontWeight: 800 }}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Supporting Copy / Description</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. No laces, no rush — comfort that clocks off exactly when you do."
                    value={formData.supportingText}
                    onChange={(e) => setFormData({ ...formData, supportingText: e.target.value })}
                    className="admin-textarea"
                  />
                </div>
              </div>

              {/* Call to Action Button */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowRight size={16} /> Call to Action (CTA Button)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '14px' }}>
                  Configure the pill action button on the left panel.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. EXPLORE DROP"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">Target Link</label>
                    <input
                      type="text"
                      placeholder="e.g. #collection-grid"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Background Theme */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Background Aesthetic</label>
                  <select
                    value={formData.background}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    className="admin-select"
                  >
                    <option value="editorial_minimal">Editorial Minimal (Off-White #fbf9f5)</option>
                    <option value="warm_cream">Warm Cream (#f5f0ea)</option>
                    <option value="dark_canvas">Dark Canvas (#0f172a - SolaWorld Ink Black)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* ── RIGHT COLUMN: Live Interactive WYSIWYG Preview ─────────────── */}
          <div
            style={{
              padding: '24px',
              backgroundColor: '#e2e8f0',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Preview Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="#0f172a" />
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                  Live Storefront Preview
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  .collection-hero__inner
                </span>
              </div>

              {/* Viewport switchers */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewport === 'desktop' ? '#0f172a' : '#f1f5f9',
                    color: viewport === 'desktop' ? '#ffffff' : '#64748b',
                  }}
                >
                  <Monitor size={14} /> Desktop (1200px)
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewport === 'mobile' ? '#0f172a' : '#f1f5f9',
                    color: viewport === 'mobile' ? '#ffffff' : '#64748b',
                  }}
                >
                  <Smartphone size={14} /> Mobile (390px)
                </button>
              </div>
            </div>

            {/* WYSIWYG Canvas Frame */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: viewport === 'mobile' ? '390px' : '100%',
                  transition: 'max-width 0.25s ease',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Storefront simulation container */}
                <div
                  className={`collection-hero collection-hero--editorial ${
                    formData.background === 'dark_canvas' ? 'collection-hero--dark' : ''
                  }`}
                  style={{
                    margin: 0,
                    backgroundColor:
                      formData.background === 'dark_canvas'
                        ? '#0f172a'
                        : formData.background === 'warm_cream'
                        ? '#f5f0ea'
                        : '#fbf9f5',
                    border: 'none',
                  }}
                >
                  <div
                    className="collection-hero__inner"
                    style={{
                      display: viewport === 'mobile' ? 'flex' : 'grid',
                      flexDirection: viewport === 'mobile' ? 'column-reverse' : undefined,
                      padding: viewport === 'mobile' ? '24px 16px' : '36px 28px',
                      minHeight: viewport === 'mobile' ? 'auto' : '360px',
                      gap: viewport === 'mobile' ? '20px' : '28px',
                    }}
                  >
                    {/* Content Column */}
                    <div className="collection-hero__content" style={{ maxWidth: '100%' }}>
                      {formData.label && (
                        <span
                          className="collection-hero__eyebrow"
                          style={{
                            color: formData.background === 'dark_canvas' ? '#ffffff' : '#0f172a',
                            background: formData.background === 'dark_canvas' ? '#1e293b' : '#ffffff',
                            borderColor: formData.background === 'dark_canvas' ? '#334155' : '#e2e8f0',
                          }}
                        >
                          <Sparkles
                            size={12}
                            color={formData.background === 'dark_canvas' ? '#ffffff' : '#0f172a'}
                          />
                          {formData.label}
                        </span>
                      )}

                      <h1
                        className="collection-hero__headline"
                        style={{
                          color: formData.background === 'dark_canvas' ? '#ffffff' : '#0f172a',
                          fontSize:
                            viewport === 'mobile' ? '1.8rem' : 'clamp(2rem, 3.2vw, 3.2rem)',
                          marginBottom: '12px',
                        }}
                      >
                        {formData.heading || 'EFFORTLESS REBOUND.'}
                      </h1>

                      <p
                        className="collection-hero__desc"
                        style={{
                          color: formData.background === 'dark_canvas' ? '#94a3b8' : '#475569',
                          fontSize: viewport === 'mobile' ? '0.88rem' : '1.02rem',
                          marginBottom: '20px',
                        }}
                      >
                        {formData.supportingText ||
                          'No laces, no rush — comfort that clocks off exactly when you do.'}
                      </p>

                      <span
                        className="collection-hero__cta"
                        style={{
                          cursor: 'pointer',
                          padding: viewport === 'mobile' ? '10px 22px' : '12px 28px',
                          fontSize: viewport === 'mobile' ? '0.8rem' : '0.86rem',
                          background: formData.background === 'dark_canvas' ? '#d8ff00' : '#0f172a',
                          color: formData.background === 'dark_canvas' ? '#0f172a' : '#ffffff',
                        }}
                      >
                        {formData.ctaText || 'EXPLORE DROP'}
                        <ArrowRight size={14} />
                      </span>
                    </div>

                    {/* Media Column */}
                    <div
                      className="collection-hero__media"
                      style={{
                        minHeight: viewport === 'mobile' ? '220px' : '260px',
                        height: viewport === 'mobile' ? '220px' : '100%',
                      }}
                    >
                      <picture>
                        {formData.mobileBannerUrl && viewport === 'mobile' && (
                          <source srcSet={formData.mobileBannerUrl} />
                        )}
                        {formData.desktopBannerUrl ? (
                          <img
                            src={
                              viewport === 'mobile' && formData.mobileBannerUrl
                                ? formData.mobileBannerUrl
                                : formData.desktopBannerUrl
                            }
                            alt={formData.heading}
                            className="collection-hero__img"
                            style={{
                              objectPosition: formData.imagePosition || 'center center',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: '220px',
                              background: '#e2e8f0',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b',
                              gap: '8px',
                            }}
                          >
                            <ImageIcon size={36} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                              No hero image uploaded
                            </span>
                          </div>
                        )}
                      </picture>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.74rem',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              Changes are reflected in real time above. Click <strong>Save & Publish Hero Banner</strong> below to deploy changes to the live storefront.
            </div>
          </div>
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={`/collections/${collection.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.82rem',
                color: '#0f172a',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Preview Live Storefront <ExternalLink size={13} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="admin-btn admin-btn-outline"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="admin-btn admin-btn-primary"
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                padding: '8px 24px',
              }}
            >
              {submitting ? 'Saving...' : 'Save & Publish Hero Banner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
