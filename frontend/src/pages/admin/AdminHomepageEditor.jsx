import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../api/api.js';
import {
  Sparkles,
  Star,
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
  Search,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';
import { AudienceSection } from '../../components/storefront/AudienceSection.jsx';
import { CategoryDiscoverySection } from '../../components/storefront/CategoryDiscoverySection.jsx';
import { ReviewCarouselSection } from '../../components/storefront/ReviewCarouselSection.jsx';
import { ErrorBoundary } from '../../components/common/ErrorBoundary.jsx';

export const AdminHomepageEditor = () => {
  const [sections, setSections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [adminPreviewTab, setAdminPreviewTab] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [railProductSearch, setRailProductSearch] = useState('');
  const [expandedCutoutProductId, setExpandedCutoutProductId] = useState(null);

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
    const clone = JSON.parse(JSON.stringify(sec));
    clone.config = clone.config || {};
    if (clone.sectionType === 'affordable_store') {
      const headline = clone.config.campaignHeadline || clone.title || 'Your day\nfound its footing.';
      const desc = clone.config.campaignDescription || clone.subtitle || 'Everyday Calzare, everyday price.\nStarting ₹999';
      clone.title = headline;
      clone.subtitle = desc;
      clone.config.campaignHeadline = headline;
      clone.config.campaignDescription = desc;
      clone.config.desktopMediaUrl = clone.config.desktopMediaUrl || clone.config.campaignImage || '';
      clone.config.campaignImage = clone.config.desktopMediaUrl;
      clone.config.badgeImageUrl = clone.config.badgeImageUrl || clone.config.campaignBadgeImg || '';
      clone.config.campaignBadgeImg = clone.config.badgeImageUrl;
      clone.config.productCutoutImages = clone.config.productCutoutImages || {};
    }
    if (clone.sectionType === 'reviews' && (!clone.config?.customerReviews || clone.config.customerReviews.length === 0)) {
      clone.config = clone.config || {};
      clone.config.customerReviews = [
        {
          id: 'rev_1',
          customerName: 'Aarav Mehta',
          rating: 5,
          title: 'Walked 18,000 steps without calf fatigue',
          comment:
            'Tested these across Bangalore monsoons and broken pavement. The dual-density microfoam absorbs every harsh impact without feeling mushy. Genuinely superior to standard EVA clogs.',
          verifiedPurchase: true,
          location: 'Bengaluru • Verified Buyer',
          productName: 'Apex Closed-Cell Clog',
          isEnabled: true,
          order: 0,
        },
        {
          id: 'rev_2',
          customerName: 'Priya Sundaram',
          rating: 5,
          title: 'Architectural shape meets all-day arch support',
          comment:
            'I wear these for 10-hour hospital shifts. The sculpted arch cradle is unmatched. My feet feel fresh when clocking off.',
          verifiedPurchase: true,
          location: 'Mumbai • Verified Buyer',
          productName: 'Apex All-Terrain Mule',
          isEnabled: true,
          order: 1,
        },
        {
          id: 'rev_3',
          customerName: 'Rohan Kapoor',
          rating: 5,
          title: '100% waterproof and effortless to rinse',
          comment:
            'Got caught in a flash downpour. Rinsed them under tap water in 20 seconds and they looked brand new. Bold aesthetic, zero ordinary energy.',
          verifiedPurchase: true,
          location: 'Delhi • Verified Buyer',
          productName: 'Urban Hydro Slide',
          isEnabled: true,
          order: 2,
        },
      ];
    }
    setEditingSection(clone);
    setSaveSuccess(false);
  };


  const currentCustomerReviews = editingSection?.config?.customerReviews || [];

  const handleUpdateCustomerReview = (idx, field, value) => {
    const updated = [...currentCustomerReviews];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        customerReviews: updated,
      },
    });
  };

  const handleAddCustomerReview = () => {
    const newRev = {
      id: `rev_${Date.now()}`,
      customerName: '',
      rating: 5,
      title: '',
      comment: '',
      verifiedPurchase: true,
      location: 'Verified Buyer',
      productName: '',
      isEnabled: true,
      order: currentCustomerReviews.length,
    };
    const updated = [...currentCustomerReviews, newRev];
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        customerReviews: updated,
      },
    });
  };

  const handleDeleteCustomerReview = (idx) => {
    if (currentCustomerReviews.length <= 1) {
      alert('At least one customer review must remain.');
      return;
    }
    const updated = currentCustomerReviews.filter((_, i) => i !== idx);
    updated.forEach((r, i) => {
      r.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        customerReviews: updated,
      },
    });
  };

  const handleMoveCustomerReview = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentCustomerReviews.length) return;
    const updated = [...currentCustomerReviews];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((r, i) => {
      r.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        customerReviews: updated,
      },
    });
  };

  const currentCategoryTiles = editingSection?.config?.categoryTiles || [];

  const handleUpdateCategoryTile = (idx, field, value) => {
    const updated = [...currentCategoryTiles];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryTiles: updated,
      },
    });
  };

  const handleMoveCategoryTile = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentCategoryTiles.length) return;
    const updated = [...currentCategoryTiles];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((t, i) => {
      t.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryTiles: updated,
      },
    });
  };

  const handleDeleteCategoryTile = (idx) => {
    if (currentCategoryTiles.length <= 1) {
      alert('At least one silhouette card must remain.');
      return;
    }
    const updated = currentCategoryTiles.filter((_, i) => i !== idx);
    updated.forEach((t, i) => {
      t.order = i;
    });
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryTiles: updated,
      },
    });
  };

  const handleAddCategoryTile = () => {
    const newTile = {
      id: `tile_${Date.now()}`,
      title: 'NEW SILHOUETTE',
      subtitle: 'Footwear features & silhouette description',
      imageUrl: '',
      link: '/shop',
      badge: '',
      order: currentCategoryTiles.length,
      isEnabled: true,
    };
    const updated = [...currentCategoryTiles, newTile];
    setEditingSection({
      ...editingSection,
      config: {
        ...editingSection.config,
        categoryTiles: updated,
      },
    });
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
        eyebrow: editingSection.eyebrow !== undefined ? editingSection.eyebrow : '',
      };
      if (payload.sectionType === 'affordable_store') {
        const headline = payload.config?.campaignHeadline || payload.title || 'Your day\nfound its footing.';
        const desc = payload.config?.campaignDescription || payload.subtitle || 'Everyday Calzare, everyday price.\nStarting ₹999';
        payload.title = headline;
        payload.subtitle = desc;
        if (payload.config) {
          payload.config.campaignHeadline = headline;
          payload.config.campaignDescription = desc;
          if (payload.config.desktopMediaUrl) {
            payload.config.campaignImage = payload.config.desktopMediaUrl;
          }
          if (payload.config.badgeImageUrl) {
            payload.config.campaignBadgeImg = payload.config.badgeImageUrl;
          }
        }
      }
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
                editingSection.sectionType === 'shop_split' ||
                editingSection.sectionType === 'category_discovery' ||
                editingSection.sectionType === 'reviews'
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
              <ErrorBoundary onReset={() => setEditingSection(null)}>
                <form onSubmit={handleSaveSection}>
                {editingSection.sectionType !== 'affordable_store' && (
                  <>
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
                  </>
                )}

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
                              : editingSection.subtitle || 'Everyday Calzare, everyday price.\nStarting ₹999'
                          }
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              subtitle: e.target.value,
                              config: { ...editingSection.config, campaignDescription: e.target.value },
                            })
                          }
                          className="admin-textarea"
                          placeholder="Everyday Calzare, everyday price.&#10;Starting ₹999"
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
                          label="Campaign Photography (Portrait)"
                          description="High-resolution portrait photography (601 × 715 px aspect ratio). Automatically updates both desktop and mobile layouts."
                          value={editingSection.config?.desktopMediaUrl !== undefined ? editingSection.config.desktopMediaUrl : (editingSection.config?.campaignImage || '/images/store999/promo.jpg')}
                          onChange={(url) =>
                            setEditingSection({
                              ...editingSection,
                              config: {
                                ...editingSection.config,
                                desktopMediaUrl: url,
                                mobileMediaUrl: url,
                                campaignImage: url,
                              },
                            })
                          }
                          aspectRatio="portrait"
                        />
                      </div>

                      <div className="admin-form-group">
                        <ImageUploadField
                          label="Mobile Campaign Photography (Optional)"
                          description="Custom mobile art direction. Leave blank to automatically use the campaign image above."
                          value={editingSection.config?.mobileMediaUrl && editingSection.config.mobileMediaUrl !== '/images/store999/promo.jpg' && editingSection.config.mobileMediaUrl !== editingSection.config.desktopMediaUrl ? editingSection.config.mobileMediaUrl : ''}
                          onChange={(url) =>
                            setEditingSection({
                              ...editingSection,
                              config: {
                                ...editingSection.config,
                                mobileMediaUrl: url || editingSection.config?.desktopMediaUrl || '',
                              },
                            })
                          }
                          aspectRatio="portrait"
                          compact={true}
                        />
                      </div>

                      <div className="admin-form-group">
                        <ImageUploadField
                          label="Badge Graphic (Near CTA)"
                          description="Circular or badge graphic (e.g. 100% Genuine, Starting ₹999)"
                          value={editingSection.config?.badgeImageUrl !== undefined ? editingSection.config.badgeImageUrl : (editingSection.config?.campaignBadgeImg || '/images/store999/badge.png')}
                          onChange={(url) =>
                            setEditingSection({
                              ...editingSection,
                              config: {
                                ...editingSection.config,
                                badgeImageUrl: url,
                                campaignBadgeImg: url,
                              },
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

                      {/* Rail Products Cutout Media & Selection */}
                      <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                              Select Rail Products & Upload Cutout Images (No Background)
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
                              Upload isolated footwear cutout PNGs with transparent backgrounds so shoes float directly on the white rail, exactly like Solaworld.
                            </p>
                          </div>
                          {editingSection.config?.productSource === 'manual_select' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-outline"
                              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                              onClick={() => {
                                const current = editingSection.config?.selectedProductIds || [];
                                const qual = availableProducts
                                  .filter((p) => (p.baseSalePrice || p.price || 0) <= (editingSection.config?.priceCap || 999))
                                  .map((p) => p._id);
                                const allSelected = qual.length > 0 && qual.every((id) => current.includes(id));
                                setEditingSection({
                                  ...editingSection,
                                  config: {
                                    ...editingSection.config,
                                    selectedProductIds: allSelected ? [] : qual,
                                  },
                                });
                              }}
                            >
                              {availableProducts.filter((p) => (p.baseSalePrice || p.price || 0) <= (editingSection.config?.priceCap || 999)).every((p) => (editingSection.config?.selectedProductIds || []).includes(p._id))
                                ? 'Deselect All'
                                : `Select All ≤ ₹${editingSection.config?.priceCap || 999}`}
                            </button>
                          )}
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                          <input
                            type="text"
                            value={railProductSearch}
                            onChange={(e) => setRailProductSearch(e.target.value)}
                            placeholder="Filter products by name or SKU..."
                            className="admin-input"
                            style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                          />
                        </div>

                        {/* Products Rail List with Cutout Uploader */}
                        <div
                          style={{
                            maxHeight: '340px',
                            overflowY: 'auto',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px',
                            background: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          {availableProducts
                            .filter((p) => {
                              if (!railProductSearch) return true;
                              const q = railProductSearch.toLowerCase();
                              return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                            })
                            .map((p) => {
                              const selectedIdsList = (editingSection.config?.selectedProductIds || []).map((id) => (id?._id || id?.toString() || id));
                              const pIdStr = p._id?.toString() || p._id;
                              const isRailProductSelected = selectedIdsList.includes(pIdStr);
                              const railCutoutUrl = (editingSection.config?.productCutoutImages && (editingSection.config.productCutoutImages[pIdStr] || editingSection.config.productCutoutImages[p._id])) || '';
                              const isExpanded = expandedCutoutProductId === p._id;

                              return (
                                <div
                                  key={p._id}
                                  style={{
                                    background: '#ffffff',
                                    border: isRailProductSelected ? '1.5px solid #0056aa' : '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {editingSection.config?.productSource === 'manual_select' && (
                                      <input
                                        type="checkbox"
                                        checked={isRailProductSelected}
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
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                      />
                                    )}

                                    {/* Shoe Preview: checkerboard if cutout active to reveal transparency */}
                                    <div
                                      style={{
                                        width: '48px',
                                        height: '42px',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0',
                                        background: railCutoutUrl
                                          ? 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 10px 10px'
                                          : '#f8fafc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <img
                                        src={getAssetUrl(railCutoutUrl || p.defaultImages?.[0]?.url || p.defaultImages?.[0] || '/images/store999/promo.jpg')}
                                        alt=""
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      />
                                    </div>

                                    {/* Product Meta */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.name}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0056aa' }}>
                                          ₹{(p.baseSalePrice || p.price || 999).toLocaleString('en-IN')}
                                        </span>
                                        {railCutoutUrl ? (
                                          <span style={{ fontSize: '0.66rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                                            ✨ No-BG Cutout Active
                                          </span>
                                        ) : (
                                          <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                                            Using Catalog Image
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <button
                                        type="button"
                                        className="admin-btn admin-btn-outline"
                                        style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                                        onClick={() => setExpandedCutoutProductId(isExpanded ? null : p._id)}
                                      >
                                        {railCutoutUrl ? (isExpanded ? 'Hide' : 'Change Cutout') : (isExpanded ? 'Cancel' : 'Upload Cutout (No BG)')}
                                      </button>
                                      {railCutoutUrl && (
                                        <button
                                          type="button"
                                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', padding: '4px' }}
                                          title="Revert to standard catalog image"
                                          onClick={() => {
                                            const next = { ...(editingSection.config?.productCutoutImages || {}) };
                                            delete next[p._id];
                                            setEditingSection({
                                              ...editingSection,
                                              config: { ...editingSection.config, productCutoutImages: next },
                                            });
                                          }}
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inline Cutout Uploader */}
                                  {isExpanded && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                                      <ImageUploadField
                                        label={`Upload Transparent Cutout PNG for ${p.name}`}
                                        description="Upload high-res PNG image with transparent background (no background color). The shoe will float directly on the white sliding rail without any bounding box."
                                        value={railCutoutUrl}
                                        onChange={(url) => {
                                          setEditingSection({
                                            ...editingSection,
                                            config: {
                                              ...editingSection.config,
                                              productCutoutImages: {
                                                ...(editingSection.config?.productCutoutImages || {}),
                                                [p._id]: url,
                                              },
                                            },
                                          });
                                        }}
                                        compact={true}
                                        aspectRatio="square"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
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
                              src={getAssetUrl(editingSection.config?.desktopMediaUrl || editingSection.config?.campaignImage || '/images/store999/promo.jpg')}
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
                                {(editingSection.config?.campaignDescription || editingSection.subtitle || 'Everyday Calzare, everyday price.\nStarting ₹999')
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
                                  src={getAssetUrl(editingSection.config?.badgeImageUrl || editingSection.config?.campaignBadgeImg || '/images/store999/badge.png')}
                                  alt=""
                                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Desktop Preview Rail */}
                          {(() => {
                            const selectedIds = editingSection.config?.selectedProductIds || [];
                            let railList = [];
                            if (editingSection.config?.productSource === 'manual_select' && selectedIds.length > 0) {
                              const railProductMap = new Map(availableProducts.map((p) => [p._id?.toString() || p._id, p]));
                              railList = selectedIds.map((id) => railProductMap.get(id?._id?.toString() || id?.toString() || id)).filter(Boolean);
                            } else {
                              railList = availableProducts.filter(
                                (p) => (p.baseSalePrice || p.price || 0) <= (editingSection.config?.priceCap || 999)
                              );
                            }
                            if (!railList.length) railList = availableProducts.slice(0, 4);
                            const displayRail = railList.slice(0, 4);

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
                                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                                  {displayRail.map((p) => {
                                    const pIdStr = p._id?.toString() || p._id;
                                    const railPreviewCutout = (editingSection.config?.productCutoutImages && (editingSection.config.productCutoutImages[pIdStr] || editingSection.config.productCutoutImages[p._id])) || '';
                                    const fallback = p.defaultImages?.[0]?.url || p.defaultImages?.[0];
                                    const imgSrc = railPreviewCutout || fallback || '/images/store999/promo.jpg';
                                    const isCutout = Boolean(railPreviewCutout);

                                    return (
                                      <div
                                        key={p._id}
                                        style={{
                                          width: '180px',
                                          flexShrink: 0,
                                          background: '#ffffff',
                                          padding: '8px 4px 14px',
                                          textAlign: 'center',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: '100%',
                                            height: '130px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                          }}
                                        >
                                          <img
                                            src={getAssetUrl(imgSrc)}
                                            alt={p.name}
                                            style={{
                                              maxWidth: '100%',
                                              maxHeight: '120px',
                                              objectFit: 'contain',
                                              filter: isCutout ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))' : 'none',
                                            }}
                                          />
                                          {isCutout && (
                                            <span
                                              style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                fontSize: '0.62rem',
                                                fontWeight: 700,
                                                background: '#dcfce7',
                                                color: '#15803d',
                                                padding: '2px 5px',
                                                borderRadius: '3px',
                                              }}
                                            >
                                              No-BG
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '0.82rem',
                                            fontWeight: 500,
                                            color: '#000000',
                                            margin: '8px 0 2px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            width: '100%',
                                          }}
                                        >
                                          {p.name}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#0056aa', fontWeight: 500 }}>
                                          ₹{(p.baseSalePrice || p.price || 999).toLocaleString('en-IN')}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Solaworld Pill Arrows Preview */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '42px',
                                      height: '24px',
                                      borderRadius: '12px',
                                      border: '1px solid #cbd5e1',
                                      color: '#64748b',
                                      fontSize: '0.72rem',
                                    }}
                                  >
                                    ←
                                  </div>
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '42px',
                                      height: '24px',
                                      borderRadius: '12px',
                                      border: '1px solid #cbd5e1',
                                      color: '#64748b',
                                      fontSize: '0.72rem',
                                    }}
                                  >
                                    →
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
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
                            {(editingSection.config?.campaignDescription || editingSection.subtitle || 'Everyday Calzare, everyday price.\nStarting ₹999')
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
                              src={getAssetUrl(editingSection.config?.badgeImageUrl || editingSection.config?.campaignBadgeImg || '/images/store999/badge.png')}
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

                {/* Category Discovery Controls (Choose Your Silhouette) */}
                {editingSection.sectionType === 'category_discovery' && (
                  <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} color="#0f172a" /> Silhouette Cards ({currentCategoryTiles.length} Silhouettes)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                          Configure footwear silhouettes (Clogs, Sliders, Sandals, Foam Walkers) with custom descriptions, links, and imagery.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handleAddCategoryTile}
                          className="admin-btn admin-btn-outline"
                          style={{ fontSize: '0.76rem', gap: '4px', background: '#ffffff' }}
                        >
                          <Plus size={13} /> Add Silhouette
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

                    {/* Section Eyebrow Input */}
                    <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                      <label className="admin-label">Section Eyebrow (Optional)</label>
                      <input
                        type="text"
                        value={editingSection.eyebrow || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, eyebrow: e.target.value })}
                        className="admin-input"
                        placeholder="e.g. CURATED FOOTWEAR"
                      />
                    </div>

                    {/* List of Silhouette Tiles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {currentCategoryTiles.map((tile, tIdx) => (
                        <div
                          key={tile.id || tIdx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '14px',
                              borderBottom: '1px solid #f1f5f9',
                              paddingBottom: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{tIdx + 1}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                                {tile.title || 'Untitled Silhouette'}
                              </span>
                              {tile.badge && (
                                <span
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                  }}
                                >
                                  {tile.badge}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={tIdx === 0}
                                onClick={() => handleMoveCategoryTile(tIdx, -1)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px' }}
                                title="Move Up / Earlier"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={tIdx === currentCategoryTiles.length - 1}
                                onClick={() => handleMoveCategoryTile(tIdx, 1)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px' }}
                                title="Move Down / Later"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCategoryTile(tIdx, 'isEnabled', tile.isEnabled === false ? true : false)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px' }}
                                title={tile.isEnabled === false ? 'Enable Silhouette' : 'Disable Silhouette'}
                              >
                                {tile.isEnabled === false ? <EyeOff size={13} color="#94a3b8" /> : <Eye size={13} color="#059669" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategoryTile(tIdx)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px', color: '#dc2626' }}
                                title="Delete Silhouette"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Silhouette Title *</label>
                              <input
                                type="text"
                                value={tile.title || ''}
                                onChange={(e) => handleUpdateCategoryTile(tIdx, 'title', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. CLOUD CLOGS"
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Subtitle / Key Specs</label>
                              <input
                                type="text"
                                value={tile.subtitle || ''}
                                onChange={(e) => handleUpdateCategoryTile(tIdx, 'subtitle', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Arch ventilation & pivot heel straps"
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Storefront Link *</label>
                              <input
                                type="text"
                                value={tile.link || ''}
                                onChange={(e) => handleUpdateCategoryTile(tIdx, 'link', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. /shop?category=clogs"
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Ribbon Badge (Optional)</label>
                              <input
                                type="text"
                                value={tile.badge || ''}
                                onChange={(e) => handleUpdateCategoryTile(tIdx, 'badge', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Popular, Trending, All-Terrain"
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Image Fitting in Card</label>
                              <select
                                value={tile.imageFit || 'contain'}
                                onChange={(e) => handleUpdateCategoryTile(tIdx, 'imageFit', e.target.value)}
                                className="admin-select"
                              >
                                <option value="contain">Auto-Fit to Div (Full Silhouette Visible - Recommended)</option>
                                <option value="cover">Fill Div Edge-to-Edge (Cover)</option>
                              </select>
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                              <ImageUploadField
                                label="Silhouette Image"
                                description="Upload an image or paste a URL — automatically fits cleanly inside the card frame"
                                value={tile.imageUrl || ''}
                                onChange={(url) => handleUpdateCategoryTile(tIdx, 'imageUrl', url)}
                                previewHeight={140}
                                objectFit={tile.imageFit || 'contain'}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Visual Preview Frame */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <label className="admin-label" style={{ marginBottom: '8px' }}>
                        Live Silhouette Preview ({adminPreviewTab === 'desktop' ? 'Desktop Grid' : 'Mobile View'})
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
                        <CategoryDiscoverySection section={editingSection} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Reviews Section Controls (WORDS FROM THE PAVEMENT) */}
                {editingSection.sectionType === 'reviews' && (
                  <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} color="#0f172a" /> Customer Reviews & Brand Words ({currentCustomerReviews.length} Reviews)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                          Add and curate customer testimonials, star ratings, and feedback for CALZARE.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handleAddCustomerReview}
                          className="admin-btn admin-btn-outline"
                          style={{ fontSize: '0.76rem', gap: '4px', background: '#ffffff' }}
                        >
                          <Plus size={13} /> Add Customer Review
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

                    {/* Source Selection */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Reviews Source</label>
                        <select
                          value={editingSection.config?.reviewsSource || 'both'}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, reviewsSource: e.target.value },
                            })
                          }
                          className="admin-select"
                        >
                          <option value="both">Both: Curated Brand Words + Live Approved Customer Reviews</option>
                          <option value="custom_curated">Curated Brand Words Only (Managed Below)</option>
                          <option value="auto_approved">Live Approved Customer Reviews Only (From Reviews Moderation)</option>
                        </select>
                        <span className="admin-hint">
                          "Both" displays curated brand testimonials followed by customer submissions approved in the Customer Reviews tab.
                        </span>
                      </div>
                    </div>

                    {/* List of Reviews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {currentCustomerReviews.map((rev, rIdx) => (
                        <div
                          key={rev.id || rIdx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            opacity: rev.isEnabled === false ? 0.6 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '14px',
                              borderBottom: '1px solid #f1f5f9',
                              paddingBottom: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{rIdx + 1}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                                {rev.customerName || 'Untitled Customer'}
                              </span>
                              <div style={{ display: 'flex', color: '#f59e0b', gap: '1px', marginLeft: '6px' }}>
                                {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                                  <Star key={i} size={12} fill="currentColor" />
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={rIdx === 0}
                                onClick={() => handleMoveCustomerReview(rIdx, -1)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 6px', opacity: rIdx === 0 ? 0.3 : 1 }}
                                title="Move Review Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={rIdx === currentCustomerReviews.length - 1}
                                onClick={() => handleMoveCustomerReview(rIdx, 1)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 6px', opacity: rIdx === currentCustomerReviews.length - 1 ? 0.3 : 1 }}
                                title="Move Review Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCustomerReview(rIdx, 'isEnabled', rev.isEnabled === false ? true : false)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                title="Toggle Visibility"
                              >
                                {rev.isEnabled !== false ? <Eye size={12} color="#047857" /> : <EyeOff size={12} color="#94a3b8" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomerReview(rIdx)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 6px', color: '#dc2626' }}
                                title="Delete Review"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Customer Name *</label>
                              <input
                                type="text"
                                value={rev.customerName || ''}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'customerName', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Arjun Mehta"
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Star Rating</label>
                              <select
                                value={rev.rating || 5}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'rating', Number(e.target.value))}
                                className="admin-select"
                              >
                                <option value={5}>5 Stars (★★★★★) - Excellent</option>
                                <option value={4}>4 Stars (★★★★☆) - Great</option>
                                <option value={3}>3 Stars (★★★☆☆) - Average</option>
                                <option value={2}>2 Stars (★★☆☆☆) - Fair</option>
                                <option value={1}>1 Star (★☆☆☆☆) - Poor</option>
                              </select>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Location / Subtitle</label>
                              <input
                                type="text"
                                value={rev.location || ''}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'location', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Bengaluru • Verified Buyer"
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-label">Footwear Silhouette / Product</label>
                              <input
                                type="text"
                                value={rev.productName || ''}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'productName', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Apex Closed-Cell Clog"
                              />
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                              <label className="admin-label">Review Headline / Title</label>
                              <input
                                type="text"
                                value={rev.title || ''}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'title', e.target.value)}
                                className="admin-input"
                                placeholder="e.g. Walked 18,000 steps without calf fatigue"
                              />
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                              <label className="admin-label">Customer Words / Feedback *</label>
                              <textarea
                                rows={3}
                                value={rev.comment || ''}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'comment', e.target.value)}
                                className="admin-textarea"
                                placeholder="Write the customer's exact words about comfort, sizing, or daily wear..."
                                required
                              />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                              <input
                                type="checkbox"
                                id={`verifiedPurchase_${rIdx}`}
                                checked={rev.verifiedPurchase !== false}
                                onChange={(e) => handleUpdateCustomerReview(rIdx, 'verifiedPurchase', e.target.checked)}
                              />
                              <label htmlFor={`verifiedPurchase_${rIdx}`} style={{ fontSize: '0.8rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
                                Verified Buyer Badge
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Visual Preview Frame */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <label className="admin-label" style={{ marginBottom: '8px' }}>
                        Live Reviews Preview ({adminPreviewTab === 'desktop' ? 'Desktop Grid' : 'Mobile View'})
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
                        <ReviewCarouselSection section={editingSection} />
                      </div>
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
            </ErrorBoundary>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
