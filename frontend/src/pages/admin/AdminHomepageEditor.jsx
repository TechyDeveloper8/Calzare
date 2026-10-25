import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';
import { AudienceSection } from '../../components/storefront/AudienceSection.jsx';

export const AdminHomepageEditor = () => {
  const [sections, setSections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [adminPreviewTab, setAdminPreviewTab] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const [secRes, collRes, prodRes] = await Promise.allSettled([
        api.adminGetSections(),
        api.adminGetCollections(),
        api.getProducts({ limit: 100 }),
      ]);
      if (secRes.status === 'fulfilled' && secRes.value?.success) {
        setSections(secRes.value.sections || []);
      }
      if (collRes.status === 'fulfilled' && collRes.value?.success) {
        setCollections(collRes.value.collections || []);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setAvailableProducts(prodRes.value.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await api.adminToggleSection(id);
      if (res.success) {
        setSections((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isEnabled: res.section.isEnabled } : s))
        );
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);

    // Save reordered array to backend
    const orderedIds = newSections.map((s) => s._id);
    await api.adminReorderSections(orderedIds);
  };

  const handleOpenEdit = (sec) => {
    setEditingSection(JSON.parse(JSON.stringify(sec)));
    setSaveSuccess(false);
  };

  const currentSplitPanels =
    editingSection?.config?.categoryPanels?.length
      ? editingSection.config.categoryPanels
      : editingSection?.config?.audienceCards || [];

  const handleUpdateSplitPanel = (idx, field, value) => {
    const updated = [...currentSplitPanels];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'text') updated[idx].tagline = value;
    if (field === 'tagline') updated[idx].text = value;
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryPanels: updated,
        audienceCards: updated,
      },
    });
  };

  const handleMoveSplitPanel = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentSplitPanels.length) return;
    const updated = [...currentSplitPanels];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((p, i) => {
      p.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryPanels: updated,
        audienceCards: updated,
      },
    });
  };

  const handleToggleSplitPanel = (idx) => {
    const updated = [...currentSplitPanels];
    updated[idx] = { ...updated[idx], isEnabled: !updated[idx].isEnabled };
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryPanels: updated,
        audienceCards: updated,
      },
    });
  };

  const handleDeleteSplitPanel = (idx) => {
    const updated = currentSplitPanels.filter((_, i) => i !== idx);
    updated.forEach((p, i) => {
      p.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryPanels: updated,
        audienceCards: updated,
      },
    });
  };

  const handleAddSplitPanel = () => {
    const newPanel = {
      id: `panel_${Date.now()}`,
      title: 'New Category',
      text: 'Category promotional message description.',
      tagline: 'Category promotional message description.',
      ctaLabel: 'Shop Category',
      link: '/collections/all',
      imageUrl: '/images/split/women-collection-image.jpg',
      mobileImageUrl: '',
      altText: 'Shop Category',
      order: currentSplitPanels.length,
      isEnabled: true,
      isPublished: true,
      objectPosition: 'center bottom',
      textAlign: 'left',
      contrastMode: 'shadow_gradient',
    };
    const updated = [...currentSplitPanels, newPanel];
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryPanels: updated,
        audienceCards: updated,
      },
    });
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...editingSection,
        eyebrow: '',
      };
      const res = await api.adminUpdateSection(editingSection._id, payload);
      if (res.success) {
        setSections((prev) => prev.map((s) => (s._id === editingSection._id ? res.section : s)));
        setSaveSuccess(true);
        setTimeout(() => setEditingSection(null), 1000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="#2563eb" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
            Homepage CMS Builder
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Reorder, toggle, and configure campaign modules and merchandised sections on the live storefront.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-outline"
          style={{ fontSize: '0.8rem' }}
        >
          <ExternalLink size={13} /> View Live Storefront
        </a>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((sec, idx) => (
          <div
            key={sec._id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: sec.isEnabled ? 1 : 0.65,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Order Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  style={{
                    opacity: idx === 0 ? 0.3 : 1,
                    padding: '2px',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                  }}
                  title="Move Section Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  style={{
                    opacity: idx === sections.length - 1 ? 0.3 : 1,
                    padding: '2px',
                    cursor: idx === sections.length - 1 ? 'default' : 'pointer',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                  }}
                  title="Move Section Down"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="corp-code" style={{ fontSize: '0.72rem' }}>
                    {sec.sectionType?.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                    {sec.title ? sec.title.replace('\n', ' ') : sec.sectionKey}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Key: <code>{sec.sectionKey}</code> • Layout: {sec.config?.layoutVariant || 'standard'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="admin-btn admin-btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => handleToggle(sec._id)}
              >
                {sec.isEnabled ? (
                  <>
                    <Eye size={13} color="#047857" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff size={13} color="#94a3b8" /> Hidden
                  </>
                )}
              </button>

              <button
                className="admin-btn admin-btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => handleOpenEdit(sec)}
              >
                <Edit size={13} /> Edit Section
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="admin-modal-backdrop" onClick={() => setEditingSection(null)}>
          <div
            className="admin-modal-container"
            style={{
              maxWidth:
                editingSection.sectionType === 'affordable_store' ||
                editingSection.sectionType === 'audience_cards' ||
                editingSection.sectionType === 'shop_split'
                  ? '940px'
                  : '640px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <span className="admin-modal-title">
                Configure Section: {editingSection.sectionKey}
              </span>
              <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveSection}>
                <div className="admin-form-group">
                  <label className="admin-label">Main Heading / Title</label>
                  <textarea
                    rows={2}
                    value={editingSection.title || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    className="admin-textarea"
                    placeholder="e.g. 0% BORING.\n100% AIR."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Subtitle / Narrative Summary</label>
                  <textarea
                    rows={3}
                    value={editingSection.subtitle || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                    className="admin-textarea"
                  />
                </div>

                {/* Hero Specific Controls */}
                {editingSection.sectionType === 'hero' && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Hero Banner Configuration
                    </div>
                    <div className="admin-form-group">
                      <ImageUploadField
                        label="Desktop Hero Banner Creative"
                        description="Directly upload high-resolution desktop hero image"
                        value={editingSection.config?.desktopMediaUrl || ''}
                        onChange={(url) =>
                          setEditingSection({
                            ...editingSection,
                            config: { ...editingSection.config, desktopMediaUrl: url },
                          })
                        }
                        aspectRatio="hero"
                      />
                    </div>

                    <div className="admin-form-group">
                      <ImageUploadField
                        label="Mobile Hero Banner Creative (Optional)"
                        description="Directly upload portrait/mobile optimized hero banner"
                        value={editingSection.config?.mobileMediaUrl || ''}
                        onChange={(url) =>
                          setEditingSection({
                            ...editingSection,
                            config: { ...editingSection.config, mobileMediaUrl: url },
                          })
                        }
                        aspectRatio="square"
                        compact={true}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Primary CTA Label</label>
                        <input
                          type="text"
                          value={editingSection.config?.primaryCtaLabel || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, primaryCtaLabel: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">CTA Target Route</label>
                        <input
                          type="text"
                          value={editingSection.config?.primaryCtaLink || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, primaryCtaLink: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SolaWorld Category Split Panels (Women, Men, Kids, Unisex) */}
                {(editingSection.sectionType === 'audience_cards' || editingSection.sectionType === 'shop_split') && (
                  <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} color="#0f172a" /> Category Split Panels ({currentSplitPanels.length} Panels)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                          Recreates SolaWorld full-height category split layout with custom copy, destinations, images, and ordering.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handleAddSplitPanel}
                          className="admin-btn admin-btn-outline"
                          style={{ fontSize: '0.76rem', gap: '4px', background: '#ffffff' }}
                        >
                          <Plus size={13} /> Add Category Panel
                        </button>
                        <div style={{ display: 'flex', gap: '3px', background: '#e2e8f0', padding: '2px', borderRadius: '4px' }}>
                          {['desktop', 'mobile'].map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setAdminPreviewTab(tab)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                borderRadius: '3px',
                                border: 'none',
                                cursor: 'pointer',
                                background: adminPreviewTab === tab ? '#ffffff' : 'transparent',
                                color: adminPreviewTab === tab ? '#0f172a' : '#64748b',
                                boxShadow: adminPreviewTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                textTransform: 'capitalize',
                              }}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Layout Variant Setting */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Desktop Grid Layout</label>
                        <select
                          value={editingSection.config?.layoutVariant || 'paired_rows'}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, layoutVariant: e.target.value },
                            })
                          }
                          className="admin-select"
                        >
                          <option value="paired_rows">Paired 2x2 Rows (SolaWorld Reference)</option>
                          <option value="4_columns">4 Columns Full Width</option>
                        </select>
                      </div>
                    </div>

                    {/* Panels List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                      {currentSplitPanels.map((panel, pIdx) => (
                        <div
                          key={panel.id || pIdx}
                          style={{
                            background: '#ffffff',
                            border: panel.isEnabled === false ? '1.5px dashed #cbd5e1' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          {/* Panel Card Header */}
                          <div
                            style={{
                              padding: '10px 14px',
                              background: panel.isEnabled === false ? '#f1f5f9' : '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{pIdx + 1}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                                {panel.title || `Panel ${pIdx + 1}`}
                              </span>
                              {panel.isEnabled === false && (
                                <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 600, background: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
                                  Hidden
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => handleMoveSplitPanel(pIdx, -1)}
                                title="Move panel up"
                                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px 6px', cursor: pIdx === 0 ? 'default' : 'pointer', opacity: pIdx === 0 ? 0.35 : 1 }}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === currentSplitPanels.length - 1}
                                onClick={() => handleMoveSplitPanel(pIdx, 1)}
                                title="Move panel down"
                                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px 6px', cursor: pIdx === currentSplitPanels.length - 1 ? 'default' : 'pointer', opacity: pIdx === currentSplitPanels.length - 1 ? 0.35 : 1 }}
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSplitPanel(pIdx)}
                                title={panel.isEnabled === false ? 'Enable panel' : 'Hide panel'}
                                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', color: panel.isEnabled === false ? '#94a3b8' : '#16a34a' }}
                              >
                                {panel.isEnabled === false ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                              {currentSplitPanels.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSplitPanel(pIdx)}
                                  title="Delete panel"
                                  style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', color: '#ef4444' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Panel Card Body */}
                          <div style={{ padding: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">Category Name / Title</label>
                                <input
                                  type="text"
                                  value={panel.title || ''}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'title', e.target.value)}
                                  className="admin-input"
                                  placeholder="e.g. Women"
                                />
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">CTA Label</label>
                                <input
                                  type="text"
                                  value={panel.ctaLabel || ''}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'ctaLabel', e.target.value)}
                                  className="admin-input"
                                  placeholder="e.g. Shop Women"
                                />
                              </div>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                              <label className="admin-label">Promotional Paragraph (Text)</label>
                              <textarea
                                rows={2}
                                value={panel.text || panel.tagline || ''}
                                onChange={(e) => handleUpdateSplitPanel(pIdx, 'text', e.target.value)}
                                className="admin-textarea"
                                placeholder="e.g. No laces, no rush — comfort that clocks off exactly when you do."
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '12px' }}>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">CTA Destination Route</label>
                                <input
                                  type="text"
                                  value={panel.link || ''}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'link', e.target.value)}
                                  className="admin-input"
                                  placeholder="e.g. /collections/women"
                                  list="split-destinations"
                                />
                                <datalist id="split-destinations">
                                  <option value="/collections/women" />
                                  <option value="/collections/men" />
                                  <option value="/collections/kids" />
                                  <option value="/collections/unisex" />
                                  <option value="/collections/under-999-store" />
                                  <option value="/collections/cloud-foam-series" />
                                  <option value="/collections/art-and-heritage" />
                                  <option value="/shop" />
                                </datalist>
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">Alt Text</label>
                                <input
                                  type="text"
                                  value={panel.altText || ''}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'altText', e.target.value)}
                                  className="admin-input"
                                  placeholder={`Shop ${panel.title || 'Category'}`}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">Image Crop / Focal Point</label>
                                <select
                                  value={panel.objectPosition || 'center bottom'}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'objectPosition', e.target.value)}
                                  className="admin-select"
                                >
                                  <option value="center bottom">Center Bottom (Default Footwear)</option>
                                  <option value="center center">Center Middle</option>
                                  <option value="center top">Center Top</option>
                                  <option value="left bottom">Left Bottom</option>
                                  <option value="right bottom">Right Bottom</option>
                                </select>
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">Text Alignment</label>
                                <select
                                  value={panel.textAlign || 'left'}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'textAlign', e.target.value)}
                                  className="admin-select"
                                >
                                  <option value="left">Left Aligned (SolaWorld Standard)</option>
                                  <option value="center">Center Aligned</option>
                                  <option value="right">Right Aligned</option>
                                </select>
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-label">Contrast Mode</label>
                                <select
                                  value={panel.contrastMode || 'shadow_gradient'}
                                  onChange={(e) => handleUpdateSplitPanel(pIdx, 'contrastMode', e.target.value)}
                                  className="admin-select"
                                >
                                  <option value="shadow_gradient">Bottom Shadow Gradient (SolaWorld)</option>
                                  <option value="dark_overlay">Full Dark Overlay</option>
                                  <option value="none">No Shadow / Clear</option>
                                </select>
                              </div>
                            </div>

                            {/* Media Uploads */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <ImageUploadField
                                  label={`Desktop Image (${panel.title || 'Panel'})`}
                                  description="Direct upload, replace, or pick from media library"
                                  value={panel.imageUrl || ''}
                                  onChange={(url) => handleUpdateSplitPanel(pIdx, 'imageUrl', url)}
                                  aspectRatio="hero"
                                  compact={true}
                                />
                              </div>
                              <div>
                                <ImageUploadField
                                  label="Mobile Image (Optional)"
                                  description="Separate mobile crop if desired"
                                  value={panel.mobileImageUrl || ''}
                                  onChange={(url) => handleUpdateSplitPanel(pIdx, 'mobileImageUrl', url)}
                                  aspectRatio="square"
                                  compact={true}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Visual Preview Frame */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                      <label className="admin-label" style={{ marginBottom: '8px' }}>
                        Live Visual Preview ({adminPreviewTab === 'desktop' ? 'Desktop Split View' : 'Mobile Stacked View'})
                      </label>
                      <div
                        style={{
                          maxWidth: adminPreviewTab === 'desktop' ? '100%' : '375px',
                          margin: '0 auto',
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          overflow: 'hidden',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        }}
                      >
                        <AudienceSection section={editingSection} isPreview={true} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Affordable Store Specific Controls (/999 Store Section) */}
                {editingSection.sectionType === 'affordable_store' && (
                  <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} color="#0147af" /> /999 Store — Editorial Campaign & Product Rail
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                          Recreates Solaworld-inspired two-part composition: promotional lifestyle panel + horizontal scrolling rail
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setAdminPreviewTab('desktop')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            border: 'none',
                            cursor: 'pointer',
                            background: adminPreviewTab === 'desktop' ? '#ffffff' : 'transparent',
                            color: adminPreviewTab === 'desktop' ? '#0f172a' : '#64748b',
                            boxShadow: adminPreviewTab === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminPreviewTab('mobile')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            border: 'none',
                            cursor: 'pointer',
                            background: adminPreviewTab === 'mobile' ? '#ffffff' : 'transparent',
                            color: adminPreviewTab === 'mobile' ? '#0f172a' : '#64748b',
                            boxShadow: adminPreviewTab === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          Mobile
                        </button>
                      </div>
                    </div>

                    {/* Part A: Promotional Campaign Panel Settings */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0147af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        A. Left Promotional Campaign Panel
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Image Focal Point</label>
                          <select
                            value={editingSection.config?.focalPoint || 'center'}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, focalPoint: e.target.value },
                              })
                            }
                            className="admin-select"
                          >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">
                          Main Headline (Use Enter / Newline for deliberate line breaks)
                        </label>
                        <textarea
                          rows={2}
                          value={
                            editingSection.config?.campaignHeadline !== undefined
                              ? editingSection.config.campaignHeadline
                              : editingSection.title || 'Your day\nfound its footing.'
                          }
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              title: e.target.value,
                              config: { ...editingSection.config, campaignHeadline: e.target.value },
                            })
                          }
                          className="admin-textarea"
                          placeholder="Your day&#10;found its footing."
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Supporting Copy (Use Enter for newline)</label>
                        <textarea
                          rows={2}
                          value={
                            editingSection.config?.campaignDescription !== undefined
                              ? editingSection.config.campaignDescription
                              : editingSection.subtitle || 'Everyday Sola, everyday price.\nStarting ₹999'
                          }
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              subtitle: e.target.value,
                              config: { ...editingSection.config, campaignDescription: e.target.value },
                            })
                          }
                          className="admin-textarea"
                          placeholder="Everyday Sola, everyday price.&#10;Starting ₹999"
                        />
                        <span className="admin-hint">
                          Starting price is automatically evaluated from active database products unless overridden above.
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">CTA Button Label</label>
                          <input
                            type="text"
                            value={editingSection.config?.primaryCtaLabel || editingSection.config?.ctaLabel || 'EXPLORE'}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: {
                                  ...editingSection.config,
                                  primaryCtaLabel: e.target.value,
                                  ctaLabel: e.target.value,
                                },
                              })
                            }
                            className="admin-input"
                            placeholder="EXPLORE"
                          />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">CTA Target Route</label>
                          <input
                            type="text"
                            value={editingSection.config?.primaryCtaLink || editingSection.config?.ctaLink || '/collections/all'}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: {
                                  ...editingSection.config,
                                  primaryCtaLink: e.target.value,
                                  ctaLink: e.target.value,
                                },
                              })
                            }
                            className="admin-input"
                            placeholder="/collections/all"
                          />
                        </div>
                      </div>

                      {/* Media Uploads */}
                      <div className="admin-form-group">
                        <ImageUploadField
                          label="Desktop Portrait Campaign Photography"
                          description="High-resolution portrait photography (601 × 715 px aspect ratio)"
                          value={editingSection.config?.desktopMediaUrl || editingSection.config?.campaignImage || '/images/store999/promo.jpg'}
                          onChange={(url) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, desktopMediaUrl: url, campaignImage: url },
                            })
                          }
                          aspectRatio="portrait"
                        />
                      </div>

                      <div className="admin-form-group">
                        <ImageUploadField
                          label="Badge Graphic (Near CTA)"
                          description="Circular or badge graphic (e.g. 100% Genuine, Starting ₹999)"
                          value={editingSection.config?.badgeImageUrl || editingSection.config?.campaignBadgeImg || '/images/store999/badge.png'}
                          onChange={(url) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, badgeImageUrl: url, campaignBadgeImg: url },
                            })
                          }
                          aspectRatio="square"
                          compact={true}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Overlay Tint Color</label>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="color"
                              value={editingSection.config?.overlayTint || '#0147af'}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  config: { ...editingSection.config, overlayTint: e.target.value },
                                })
                              }
                              style={{ width: '38px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={editingSection.config?.overlayTint || '#0147af'}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  config: { ...editingSection.config, overlayTint: e.target.value },
                                })
                              }
                              className="admin-input"
                              placeholder="#0147af"
                            />
                          </div>
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">
                            Tint Opacity ({Math.round((editingSection.config?.overlayOpacity ?? 0.75) * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={editingSection.config?.overlayOpacity ?? 0.75}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, overlayOpacity: parseFloat(e.target.value) },
                              })
                            }
                            style={{ width: '100%', marginTop: '10px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Part B: Product Rail Merchandising Settings */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0147af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        B. Right Horizontal Product Rail & Merchandising
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Product Source Method</label>
                          <select
                            value={editingSection.config?.productSource || 'price_filter'}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, productSource: e.target.value },
                              })
                            }
                            className="admin-select"
                          >
                            <option value="price_filter">Auto: All Products ≤ Price Cap</option>
                            <option value="collection_slug">Collection: Filter by Collection</option>
                            <option value="manual_select">Manual: Hand-pick Specific Products</option>
                          </select>
                        </div>

                        {editingSection.config?.productSource === 'collection_slug' && (
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">Select Collection</label>
                            <select
                              value={editingSection.config?.collectionSlug || ''}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  config: { ...editingSection.config, collectionSlug: e.target.value },
                                })
                              }
                              className="admin-select"
                            >
                              <option value="">All Products</option>
                              {collections.map((coll) => (
                                <option key={coll._id} value={coll.slug}>
                                  {coll.name} ({coll.slug})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Price Ceiling (₹ Cap)</label>
                          <input
                            type="number"
                            value={editingSection.config?.priceCap || 999}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, priceCap: Number(e.target.value) },
                              })
                            }
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Max Rail Items</label>
                          <select
                            value={editingSection.config?.maxProducts || 8}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, maxProducts: Number(e.target.value) },
                              })
                            }
                            className="admin-select"
                          >
                            <option value={4}>4 Products</option>
                            <option value={6}>6 Products</option>
                            <option value={8}>8 Products</option>
                            <option value={10}>10 Products</option>
                            <option value={12}>12 Products</option>
                            <option value={16}>16 Products</option>
                          </select>
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Catalogue Sort</label>
                          <select
                            value={editingSection.config?.sortBy || 'price_asc'}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                config: { ...editingSection.config, sortBy: e.target.value },
                              })
                            }
                            className="admin-select"
                          >
                            <option value="price_asc">Price: Low to High</option>
                            <option value="salesCount">Bestsellers First</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_desc">Price: High to Low</option>
                          </select>
                        </div>
                      </div>

                      {/* Manual Product Selector */}
                      {editingSection.config?.productSource === 'manual_select' && (
                        <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                          <label className="admin-label" style={{ marginBottom: '6px' }}>
                            Pick Products for /999 Store ({editingSection.config?.selectedProductIds?.length || 0} selected)
                          </label>
                          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', background: '#f8fafc' }}>
                            {availableProducts.map((p) => {
                              const isChecked = (editingSection.config?.selectedProductIds || []).includes(p._id);
                              return (
                                <label
                                  key={p._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '6px 8px',
                                    borderBottom: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    background: isChecked ? '#e0f2fe' : 'transparent',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = editingSection.config?.selectedProductIds || [];
                                      const next = e.target.checked
                                        ? [...current, p._id]
                                        : current.filter((id) => id !== p._id);
                                      setEditingSection({
                                        ...editingSection,
                                        config: { ...editingSection.config, selectedProductIds: next },
                                      });
                                    }}
                                  />
                                  <img
                                    src={p.defaultImages?.[0]?.url || p.defaultImages?.[0] || '/images/store999/promo.jpg'}
                                    alt=""
                                    style={{ width: '32px', height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '3px' }}
                                  />
                                  <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                                    {p.name}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0147af' }}>
                                    ₹{(p.baseSalePrice || p.price || 999).toLocaleString('en-IN')}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part C: Live Visual Preview */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                      <label className="admin-label" style={{ marginBottom: '8px' }}>
                        Live Visual Preview ({adminPreviewTab === 'desktop' ? 'Desktop Two-Part Layout' : 'Mobile Stacked Layout'})
                      </label>

                      {adminPreviewTab === 'desktop' ? (
                        <div
                          style={{
                            maxWidth: '720px',
                            margin: '0 auto',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            padding: '24px',
                            display: 'grid',
                            gridTemplateColumns: '260px 1fr',
                            gap: '20px',
                            alignItems: 'center',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                          }}
                        >
                          {/* Desktop Preview Promo Card */}
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '360px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: editingSection.config?.promoBgColor || '#0147af',
                            }}
                          >
                            <img
                              src={editingSection.config?.desktopMediaUrl || '/images/store999/promo.jpg'}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: editingSection.config?.focalPoint || 'center' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: editingSection.config?.overlayTint || '#0147af',
                                mixBlendMode: 'multiply',
                                opacity: editingSection.config?.overlayOpacity ?? 0.75,
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                zIndex: 1,
                                color: '#ffffff',
                              }}
                            >
                              <div style={{ marginTop: '90px', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.2 }}>
                                {(editingSection.config?.campaignHeadline || editingSection.title || 'Your day\nfound its footing.')
                                  .split('\n')
                                  .map((l, i) => (
                                    <React.Fragment key={i}>
                                      {l}
                                      <br />
                                    </React.Fragment>
                                  ))}
                              </div>
                              <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '8px', lineHeight: 1.4 }}>
                                {(editingSection.config?.campaignDescription || editingSection.subtitle || 'Everyday Sola, everyday price.\nStarting ₹999')
                                  .split('\n')
                                  .map((l, i) => (
                                    <React.Fragment key={i}>
                                      {l}
                                      <br />
                                    </React.Fragment>
                                  ))}
                              </div>
                              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span
                                  style={{
                                    background: '#004ba0',
                                    border: '1px solid #ffffff',
                                    color: '#ffffff',
                                    padding: '6px 18px',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {editingSection.config?.primaryCtaLabel || 'EXPLORE'}
                                </span>
                                <img
                                  src={editingSection.config?.badgeImageUrl || '/images/store999/badge.png'}
                                  alt=""
                                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Desktop Preview Rail Sample */}
                          <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
                            {[1, 2].map((idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: '160px',
                                  flexShrink: 0,
                                  border: '1px solid #f1f5f9',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  textAlign: 'center',
                                }}
                              >
                                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <img
                                    src="/images/store999/promo.jpg"
                                    alt=""
                                    style={{ maxHeight: '90px', objectFit: 'contain' }}
                                  />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#000', margin: '6px 0 2px' }}>
                                  Veyron Clogs {idx}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#0056aa', fontWeight: 600 }}>
                                  ₹999
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Mobile Preview Layout */
                        <div
                          style={{
                            maxWidth: '320px',
                            margin: '0 auto',
                            background: '#0020a1',
                            borderRadius: '12px',
                            padding: '24px 18px',
                            color: '#ffffff',
                            textAlign: 'left',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          }}
                        >
                          <div style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.2, margin: '14px 0 8px' }}>
                            {(editingSection.config?.campaignHeadline || editingSection.title || 'Your day\nfound its footing.')
                              .split('\n')
                              .map((l, i) => (
                                <React.Fragment key={i}>
                                  {l}
                                  <br />
                                </React.Fragment>
                              ))}
                          </div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.9, lineHeight: 1.4 }}>
                            {(editingSection.config?.campaignDescription || editingSection.subtitle || 'Everyday Sola, everyday price.\nStarting ₹999')
                              .split('\n')
                              .map((l, i) => (
                                <React.Fragment key={i}>
                                  {l}
                                  <br />
                                </React.Fragment>
                              ))}
                          </div>
                          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                background: '#004ba0',
                                border: '1px solid #ffffff',
                                color: '#ffffff',
                                padding: '6px 20px',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {editingSection.config?.primaryCtaLabel || 'EXPLORE'}
                            </span>
                            <img
                              src={editingSection.config?.badgeImageUrl || '/images/store999/badge.png'}
                              alt=""
                              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Storytelling Controls */}
                {editingSection.sectionType === 'storytelling' && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Storytelling & Craftsmanship Media
                    </div>
                    <div className="admin-form-group">
                      <ImageUploadField
                        label="Story Primary Photography"
                        description="Upload main editorial photo"
                        value={editingSection.config?.storytelling?.primaryImageUrl || ''}
                        onChange={(url) =>
                          setEditingSection({
                            ...editingSection,
                            config: {
                              ...editingSection.config,
                              storytelling: {
                                ...(editingSection.config?.storytelling || {}),
                                primaryImageUrl: url,
                              },
                            },
                          })
                        }
                        aspectRatio="banner"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Quote or Manifesto</label>
                      <input
                        type="text"
                        value={editingSection.config?.storytelling?.quote || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            config: {
                              ...editingSection.config,
                              storytelling: {
                                ...(editingSection.config?.storytelling || {}),
                                quote: e.target.value,
                              },
                            },
                          })
                        }
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-label">Narrative Body Text</label>
                      <textarea
                        rows={3}
                        value={editingSection.config?.storytelling?.bodyText || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            config: {
                              ...editingSection.config,
                              storytelling: {
                                ...(editingSection.config?.storytelling || {}),
                                bodyText: e.target.value,
                              },
                            },
                          })
                        }
                        className="admin-textarea"
                      />
                    </div>
                  </div>
                )}

                {/* Bestsellers Controls */}
                {(editingSection.sectionType === 'bestsellers' || editingSection.sectionType === 'product_grid') && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Product Grid Display Limits
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-label">Maximum Products to Show</label>
                      <input
                        type="number"
                        min="4"
                        max="24"
                        value={editingSection.config?.maxProducts || 8}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            config: { ...editingSection.config, maxProducts: Number(e.target.value) },
                          })
                        }
                        className="admin-input"
                      />
                    </div>
                  </div>
                )}

                {saveSuccess && (
                  <div
                    style={{
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      marginBottom: '14px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle size={14} /> Changes published live to storefront!
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Publishing...' : 'Publish Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
