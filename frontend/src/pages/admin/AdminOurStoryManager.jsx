import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  ExternalLink,
  Layers,
  Settings,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  AlertCircle,
  RefreshCw,
  Globe,
  Tag,
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';

// Available section types metadata
const SECTION_TEMPLATES = [
  {
    type: 'hero',
    name: 'Section A — Story Hero / The Origin',
    description: 'Editorial brand origin hero with large typography, media, and bold CTA.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      paragraph: '',
      desktopImageUrl: '',
      mobileImageUrl: '',
      videoUrl: '',
      focalPoint: 'center',
      textAlign: 'left',
      ctaLabel: '',
      ctaLink: '',
      backgroundTheme: 'warm_cream',
      accentColor: '#d8ff00',
      overlayOpacity: 0.15,
    },
  },
  {
    type: 'stats',
    name: 'Section B — Brand Statistics',
    description: 'Verified milestones and metrics with accessible number counters.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      layoutVariant: 'grid_4',
      animateOnScroll: true,
      items: [],
    },
  },
  {
    type: 'craftsmanship',
    name: 'Section C — Craftsmanship (Factory to Feet)',
    description: 'Authentic manufacturing storytelling with image-text layouts.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      richText: '',
      primaryImageUrl: '',
      secondaryImageUrl: '',
      imagePlacement: 'image_left',
      layoutVariant: 'image_left',
      ctaLabel: '',
      ctaLink: '',
      backgroundTheme: 'warm_cream',
    },
  },
  {
    type: 'timeline',
    name: 'Section D — Our Journey Timeline',
    description: 'Historical milestones with media, dates, and subtle line progression.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      layoutVariant: 'vertical',
      milestones: [],
    },
  },
  {
    type: 'philosophy',
    name: 'Section E — Product Philosophy & Live Rail',
    description: 'Design philosophy connected to real published products from catalog.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      supportingCopy: '',
      mediaUrl: '',
      ctaLabel: '',
      ctaLink: '',
      layoutVariant: 'split',
      backgroundTheme: 'warm_cream',
      showProductRail: false,
      productRailSource: 'auto',
      collectionSlug: '',
      categoryId: '',
      railHeading: 'EXPLORE OUR SILHOUETTES',
      maxRailProducts: 6,
    },
  },
  {
    type: 'manufacturing',
    name: 'Section F — Manufacturing Process',
    description: 'Step-by-step production stages with media and process cards.',
    defaultConfig: {
      eyebrow: '',
      heading: '',
      layoutVariant: 'grid',
      stages: [],
    },
  },
  {
    type: 'closing_statement',
    name: 'Section G — Closing Brand Statement',
    description: 'Bold, memorable editorial manifesto with high-contrast visuals.',
    defaultConfig: {
      eyebrow: '',
      mainStatement: '',
      supportingText: '',
      desktopImageUrl: '',
      mobileImageUrl: '',
      videoUrl: '',
      ctaLabel: '',
      ctaLink: '',
      imagePositioning: 'center',
      backgroundTheme: 'ink_black',
      accentColor: '#d8ff00',
    },
  },
];

export const AdminOurStoryManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Page state
  const [page, setPage] = useState({
    title: 'Our Story',
    slug: 'about-us',
    metaTitle: 'Our Story — SolaWorld Footwear',
    metaDescription: 'Discover the story, craftsmanship, and design philosophy behind SolaWorld footwear.',
    ogImage: '',
    isPublished: false,
    publishedVersion: 0,
    sections: [],
  });

  // Catalog dependencies for Section E
  const [catalog, setCatalog] = useState({
    collections: [],
    categories: [],
    products: [],
  });

  // Editor UI State
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'seo'
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  // Load Story CMS Draft Data
  const loadStoryData = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetStoryPage('about-us');
      if (res.success && res.page) {
        setPage(res.page);
        if (res.page.sections?.length > 0 && !activeSectionId) {
          setActiveSectionId(res.page.sections[0].sectionId);
        }
      }
      if (res.catalog) {
        setCatalog(res.catalog);
      }
    } catch (err) {
      console.error('Error loading story page draft:', err);
      showNotice('Failed to load story page: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoryData();
  }, []);

  const showNotice = (msg, type = 'success') => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // Section Reordering, Adding, Duplicating, Deleting, Toggling
  // -------------------------------------------------------------
  const handleMoveSection = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= page.sections.length) return;

    const updated = [...page.sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Reassign displayOrder
    updated.forEach((s, idx) => {
      s.displayOrder = idx;
    });

    setPage((prev) => ({ ...prev, sections: updated }));

    try {
      const orderedIds = updated.map((s) => s.sectionId);
      await api.adminReorderStorySections(orderedIds, page.slug);
      showNotice('Section order updated');
    } catch (err) {
      showNotice('Failed to reorder: ' + err.message, 'error');
    }
  };

  const handleToggleSection = async (sectionId) => {
    try {
      const res = await api.adminToggleStorySection(sectionId, page.slug);
      if (res.success) {
        setPage((prev) => ({
          ...prev,
          sections: prev.sections.map((s) =>
            s.sectionId === sectionId ? { ...s, isEnabled: !s.isEnabled } : s
          ),
        }));
        showNotice('Section visibility updated');
      }
    } catch (err) {
      showNotice('Error toggling visibility: ' + err.message, 'error');
    }
  };

  const handleAddSection = async (template) => {
    try {
      const payload = {
        sectionType: template.type,
        title: template.name.split(' — ')[1] || template.name,
        config: JSON.parse(JSON.stringify(template.defaultConfig)),
      };

      const res = await api.adminAddStorySection(payload, page.slug);
      if (res.success) {
        setPage(res.page);
        setActiveSectionId(res.section.sectionId);
        setShowAddModal(false);
        showNotice(`Added ${template.name}`);
      }
    } catch (err) {
      showNotice('Error adding section: ' + err.message, 'error');
    }
  };

  const handleDuplicateSection = async (sectionId) => {
    try {
      const res = await api.adminDuplicateStorySection(sectionId, page.slug);
      if (res.success) {
        setPage(res.page);
        showNotice('Section duplicated');
      }
    } catch (err) {
      showNotice('Error duplicating section: ' + err.message, 'error');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const res = await api.adminDeleteStorySection(sectionId, page.slug);
      if (res.success) {
        setPage(res.page);
        if (activeSectionId === sectionId) {
          const remaining = res.page.sections || [];
          setActiveSectionId(remaining[0]?.sectionId || null);
        }
        setConfirmDeleteModal(null);
        showNotice('Section deleted');
      }
    } catch (err) {
      showNotice('Error deleting section: ' + err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // Config Updates for Active Section
  // -------------------------------------------------------------
  const activeSection = page.sections?.find((s) => s.sectionId === activeSectionId) || null;

  const updateActiveSectionConfig = (field, value) => {
    if (!activeSection) return;
    const updatedSections = page.sections.map((s) => {
      if (s.sectionId === activeSectionId) {
        return {
          ...s,
          config: {
            ...s.config,
            [field]: value,
          },
        };
      }
      return s;
    });
    setPage((prev) => ({ ...prev, sections: updatedSections }));
  };

  const updateActiveSectionTitle = (title) => {
    if (!activeSection) return;
    const updatedSections = page.sections.map((s) => {
      if (s.sectionId === activeSectionId) {
        return { ...s, title };
      }
      return s;
    });
    setPage((prev) => ({ ...prev, sections: updatedSections }));
  };

  // -------------------------------------------------------------
  // Save Draft & Publishing Actions
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await api.adminUpdateStoryPage(page, page.slug);
      if (res.success) {
        setPage(res.page);
        showNotice('Draft saved successfully');
      }
    } catch (err) {
      showNotice('Error saving draft: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish current story draft to the live storefront?')) return;
    try {
      setPublishing(true);
      // Ensure draft is saved first
      await api.adminUpdateStoryPage(page, page.slug);
      const res = await api.adminPublishStoryPage(page.slug);
      if (res.success) {
        setPage(res.page);
        showNotice(`Published live! Version ${res.page.publishedVersion}`);
      }
    } catch (err) {
      showNotice('Error publishing: ' + err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish this page? Public storefront visitors will not see it.')) return;
    try {
      setPublishing(true);
      const res = await api.adminUnpublishStoryPage(page.slug);
      if (res.success) {
        setPage(res.page);
        showNotice('Page unpublished from live storefront');
      }
    } catch (err) {
      showNotice('Error unpublishing: ' + err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Our Story CMS...</p>
      </div>
    );
  }

  return (
    <div className="admin-our-story-page" style={{ padding: '24px 32px 100px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Status Notice Toast */}
      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            background: statusMessage.type === 'error' ? '#ef4444' : '#10b981',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {statusMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {statusMessage.msg}
        </div>
      )}

      {/* Top Header & Publishing Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 24px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Our Story Manager
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                background: page.isPublished ? '#dcfce7' : '#fef3c7',
                color: page.isPublished ? '#166534' : '#92400e',
              }}
            >
              {page.isPublished ? `LIVE (v${page.publishedVersion || 1})` : 'DRAFT'}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Slug: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>/{page.slug}</code>
            {page.publishedAt && ` • Published ${new Date(page.publishedAt).toLocaleDateString()}`}
          </p>
        </div>

        {/* Viewport Switcher & Primary Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Responsive Preview Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => setPreviewViewport('desktop')}
              title="Desktop View (100%)"
              style={{
                border: 'none',
                background: previewViewport === 'desktop' ? '#ffffff' : 'transparent',
                color: previewViewport === 'desktop' ? '#0f172a' : '#64748b',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Monitor size={15} /> Desktop
            </button>
            <button
              onClick={() => setPreviewViewport('tablet')}
              title="Tablet View (768px)"
              style={{
                border: 'none',
                background: previewViewport === 'tablet' ? '#ffffff' : 'transparent',
                color: previewViewport === 'tablet' ? '#0f172a' : '#64748b',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Tablet size={15} /> Tablet
            </button>
            <button
              onClick={() => setPreviewViewport('mobile')}
              title="Mobile View (375px)"
              style={{
                border: 'none',
                background: previewViewport === 'mobile' ? '#ffffff' : 'transparent',
                color: previewViewport === 'mobile' ? '#0f172a' : '#64748b',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Smartphone size={15} /> Mobile
            </button>
          </div>

          {/* External Draft Preview Link */}
          <a
            href="/about?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={15} /> Preview Storefront
          </a>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Publish / Unpublish */}
          {page.isPublished ? (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: publishing ? 'not-allowed' : 'pointer',
              }}
            >
              Unpublish
            </button>
          ) : null}

          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: publishing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <CheckCircle size={15} /> {publishing ? 'Publishing...' : 'Publish to Live'}
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Left Section Tree + Middle Deep Editor + Right Live Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(420px, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Sections List & Management */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Tabs: Sections vs Page SEO */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <button
              onClick={() => setActiveTab('sections')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'sections' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: activeTab === 'sections' ? '#0f172a' : '#64748b',
                borderBottom: activeTab === 'sections' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Layers size={14} /> Sections ({page.sections?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'seo' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: activeTab === 'seo' ? '#0f172a' : '#64748b',
                borderBottom: activeTab === 'seo' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Settings size={14} /> Page SEO
            </button>
          </div>

          {activeTab === 'sections' ? (
            <div style={{ padding: '16px' }}>
              {/* Add Section Button */}
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                <Plus size={16} /> Add Story Section
              </button>

              {/* Sections List */}
              {page.sections?.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>No sections added</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                    Click above to add Section A (Hero), B (Stats), C (Craftsmanship), etc.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {page.sections.map((sec, idx) => {
                    const isSelected = sec.sectionId === activeSectionId;
                    return (
                      <div
                        key={sec.sectionId}
                        onClick={() => setActiveSectionId(sec.sectionId)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : sec.isEnabled ? '#ffffff' : '#f8fafc',
                          opacity: sec.isEnabled ? 1 : 0.6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                background: isSelected ? '#2563eb' : '#e2e8f0',
                                color: isSelected ? '#ffffff' : '#475569',
                              }}
                            >
                              {sec.sectionType}
                            </span>
                            <span
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: isSelected ? 700 : 600,
                                color: '#0f172a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {sec.title || sec.sectionType}
                            </span>
                          </div>
                        </div>

                        {/* Action Icons */}
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleMoveSection(idx, -1)}
                            disabled={idx === 0}
                            title="Move Up"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: idx === 0 ? '#cbd5e1' : '#64748b',
                              cursor: idx === 0 ? 'default' : 'pointer',
                              padding: '3px',
                            }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveSection(idx, 1)}
                            disabled={idx === page.sections.length - 1}
                            title="Move Down"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: idx === page.sections.length - 1 ? '#cbd5e1' : '#64748b',
                              cursor: idx === page.sections.length - 1 ? 'default' : 'pointer',
                              padding: '3px',
                            }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleSection(sec.sectionId)}
                            title={sec.isEnabled ? 'Hide Section' : 'Show Section'}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: sec.isEnabled ? '#2563eb' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '3px',
                            }}
                          >
                            {sec.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handleDuplicateSection(sec.sectionId)}
                            title="Duplicate"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '3px',
                            }}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteModal(sec.sectionId)}
                            title="Delete"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '3px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* SEO Tab */
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Page Title (Admin)
                </label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Page Slug
                </label>
                <input
                  type="text"
                  value={page.slug || 'about-us'}
                  onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Storefront route: /{page.slug}</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={page.metaTitle || ''}
                  onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={page.metaDescription || ''}
                  onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <ImageUploadField
                  label="Social Sharing Image (OG Image)"
                  value={page.ogImage || ''}
                  onChange={(url) => setPage({ ...page, ogImage: url })}
                  description="Optimal dimensions: 1200 x 630 px"
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle / Right Column: Deep Section Configuration */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
          }}
        >
          {!activeSection ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No Section Selected</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Choose a section from the left panel to configure its editorial copy and assets, or add a new section.
              </p>
            </div>
          ) : (
            <div>
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#eff6ff',
                        color: '#2563eb',
                      }}
                    >
                      {activeSection.sectionType}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      {activeSection.title}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
                    ID: <code style={{ fontSize: '0.75rem' }}>{activeSection.sectionId}</code>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={activeSection.isEnabled}
                      onChange={() => handleToggleSection(activeSection.sectionId)}
                    />
                    Enabled
                  </label>
                </div>
              </div>

              {/* Section Title Editor */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Admin Label / Section Name
                </label>
                <input
                  type="text"
                  value={activeSection.title || ''}
                  onChange={(e) => updateActiveSectionTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* SECTION A — HERO CONFIG */}
              {activeSection.sectionType === 'hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. THE ORIGIN / ARCHITECTURE OF AIR"
                        value={activeSection.config?.eyebrow || ''}
                        onChange={(e) => updateActiveSectionConfig('eyebrow', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Text Alignment
                      </label>
                      <select
                        value={activeSection.config?.textAlign || 'left'}
                        onChange={(e) => updateActiveSectionConfig('textAlign', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Centered Editorial</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Main Heading (Large Typography)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 0% BORING. 100% REVOLUTION."
                      value={activeSection.config?.heading || ''}
                      onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Supporting Paragraph
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter verified brand background copy..."
                      value={activeSection.config?.paragraph || ''}
                      onChange={(e) => updateActiveSectionConfig('paragraph', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <ImageUploadField
                      label="Desktop Hero Image"
                      value={activeSection.config?.desktopImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('desktopImageUrl', url)}
                      aspectRatio="banner"
                    />
                    <ImageUploadField
                      label="Mobile Hero Image"
                      value={activeSection.config?.mobileImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('mobileImageUrl', url)}
                      aspectRatio="square"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Optional Background Video URL (MP4)
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={activeSection.config?.videoUrl || ''}
                        onChange={(e) => updateActiveSectionConfig('videoUrl', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Image Focal Point
                      </label>
                      <select
                        value={activeSection.config?.focalPoint || 'center'}
                        onChange={(e) => updateActiveSectionConfig('focalPoint', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Call-to-Action Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. EXPLORE OUR COLLECTION"
                        value={activeSection.config?.ctaLabel || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLabel', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        CTA Destination Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /shop"
                        value={activeSection.config?.ctaLink || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Background Theme
                      </label>
                      <select
                        value={activeSection.config?.backgroundTheme || 'warm_cream'}
                        onChange={(e) => updateActiveSectionConfig('backgroundTheme', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="warm_cream">Warm Cream (Editorial Off-White)</option>
                        <option value="ink_black">Ink Black (Dramatic Contrast)</option>
                        <option value="stone_light">Stone Light</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Accent Color
                      </label>
                      <input
                        type="text"
                        placeholder="#d8ff00"
                        value={activeSection.config?.accentColor || '#d8ff00'}
                        onChange={(e) => updateActiveSectionConfig('accentColor', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B — BRAND STATISTICS */}
              {activeSection.sectionType === 'stats' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. VERIFIED NUMBERS"
                        value={activeSection.config?.eyebrow || ''}
                        onChange={(e) => updateActiveSectionConfig('eyebrow', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BUILT DIFFERENT BY DESIGN"
                        value={activeSection.config?.heading || ''}
                        onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      Configured Statistics Items ({(activeSection.config?.items || []).length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = activeSection.config?.items || [];
                        const newItem = {
                          id: 'stat_' + Date.now(),
                          value: '',
                          label: '',
                          description: '',
                          displayOrder: current.length,
                          isEnabled: true,
                        };
                        updateActiveSectionConfig('items', [...current, newItem]);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={14} /> Add Statistic
                    </button>
                  </div>

                  {(activeSection.config?.items || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '0.84rem' }}>
                        No statistics configured. Add only real, verified company metrics (e.g. "100%", "280g"). No fake zeros or mock customer counts!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(activeSection.config?.items || []).map((item, sIdx) => (
                        <div
                          key={item.id || sIdx}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr 1fr 40px',
                            gap: '12px',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Value / Metric</span>
                            <input
                              type="text"
                              placeholder="e.g. 100% or 280g"
                              value={item.value || ''}
                              onChange={(e) => {
                                const copy = [...(activeSection.config?.items || [])];
                                copy[sIdx].value = e.target.value;
                                updateActiveSectionConfig('items', copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Metric Label</span>
                            <input
                              type="text"
                              placeholder="e.g. Waterproof Closed-Cell"
                              value={item.label || ''}
                              onChange={(e) => {
                                const copy = [...(activeSection.config?.items || [])];
                                copy[sIdx].label = e.target.value;
                                updateActiveSectionConfig('items', copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Description</span>
                            <input
                              type="text"
                              placeholder="Supporting detail..."
                              value={item.description || ''}
                              onChange={(e) => {
                                const copy = [...(activeSection.config?.items || [])];
                                copy[sIdx].description = e.target.value;
                                updateActiveSectionConfig('items', copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (activeSection.config?.items || []).filter((_, i) => i !== sIdx);
                                updateActiveSectionConfig('items', copy);
                              }}
                              title="Delete Stat"
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', marginTop: '16px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION C — CRAFTSMANSHIP */}
              {activeSection.sectionType === 'craftsmanship' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MONOLITHIC INJECTION MOLDS"
                        value={activeSection.config?.eyebrow || ''}
                        onChange={(e) => updateActiveSectionConfig('eyebrow', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Layout Variant
                      </label>
                      <select
                        value={activeSection.config?.layoutVariant || 'image_left'}
                        onChange={(e) => updateActiveSectionConfig('layoutVariant', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="image_left">Image Left, Text Right</option>
                        <option value="text_left">Text Left, Image Right</option>
                        <option value="full_width_overlay">Full Width Image Overlay</option>
                        <option value="split">Editorial Split Gallery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Heading
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FROM FACTORY TO YOUR FEET"
                      value={activeSection.config?.heading || ''}
                      onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.96rem', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Editorial Description (Rich Text / Multi-Paragraph)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Describe the craftsmanship process and authentic approach..."
                      value={activeSection.config?.richText || ''}
                      onChange={(e) => updateActiveSectionConfig('richText', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <ImageUploadField
                      label="Primary Craftsmanship Image"
                      value={activeSection.config?.primaryImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('primaryImageUrl', url)}
                    />
                    <ImageUploadField
                      label="Optional Secondary Image"
                      value={activeSection.config?.secondaryImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('secondaryImageUrl', url)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DISCOVER MATERIALS"
                        value={activeSection.config?.ctaLabel || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLabel', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        CTA Link Destination
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /shop"
                        value={activeSection.config?.ctaLink || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D — TIMELINE */}
              {activeSection.sectionType === 'timeline' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. OUR JOURNEY"
                        value={activeSection.config?.heading || ''}
                        onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Desktop Timeline Layout
                      </label>
                      <select
                        value={activeSection.config?.layoutVariant || 'vertical'}
                        onChange={(e) => updateActiveSectionConfig('layoutVariant', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="vertical">Editorial Vertical Spine</option>
                        <option value="horizontal">Horizontal Milestone Cards</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      Milestones ({(activeSection.config?.milestones || []).length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = activeSection.config?.milestones || [];
                        const newMilestone = {
                          id: 'ms_' + Date.now(),
                          yearOrDate: '',
                          milestoneLabel: '',
                          heading: '',
                          description: '',
                          mediaUrl: '',
                          displayOrder: current.length,
                          isEnabled: true,
                        };
                        updateActiveSectionConfig('milestones', [...current, newMilestone]);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={14} /> Add Milestone
                    </button>
                  </div>

                  {(activeSection.config?.milestones || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '0.84rem' }}>
                        No milestones added. Add real company progression dates and milestones without inventing history.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(activeSection.config?.milestones || []).map((ms, mIdx) => (
                        <div
                          key={ms.id || mIdx}
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                              Milestone #{mIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (activeSection.config?.milestones || []).filter((_, i) => i !== mIdx);
                                updateActiveSectionConfig('milestones', copy);
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Year / Date</label>
                              <input
                                type="text"
                                placeholder="e.g. 2024"
                                value={ms.yearOrDate || ''}
                                onChange={(e) => {
                                  const copy = [...(activeSection.config?.milestones || [])];
                                  copy[mIdx].yearOrDate = e.target.value;
                                  updateActiveSectionConfig('milestones', copy);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Milestone Heading</label>
                              <input
                                type="text"
                                placeholder="e.g. The First Monolithic Mold Prototype"
                                value={ms.heading || ''}
                                onChange={(e) => {
                                  const copy = [...(activeSection.config?.milestones || [])];
                                  copy[mIdx].heading = e.target.value;
                                  updateActiveSectionConfig('milestones', copy);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Description</label>
                            <textarea
                              rows={2}
                              placeholder="Detail the milestone event..."
                              value={ms.description || ''}
                              onChange={(e) => {
                                const copy = [...(activeSection.config?.milestones || [])];
                                copy[mIdx].description = e.target.value;
                                updateActiveSectionConfig('milestones', copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                          </div>

                          <ImageUploadField
                            label="Milestone Media (Image)"
                            value={ms.mediaUrl || ''}
                            onChange={(url) => {
                              const copy = [...(activeSection.config?.milestones || [])];
                              copy[mIdx].mediaUrl = url;
                              updateActiveSectionConfig('milestones', copy);
                            }}
                            compact={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION E — PHILOSOPHY & PRODUCT RAIL */}
              {activeSection.sectionType === 'philosophy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Philosophy Heading
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ARCHITECTURE FOR WEIGHTLESS LIVING"
                      value={activeSection.config?.heading || ''}
                      onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Philosophy Copy
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the product philosophy..."
                      value={activeSection.config?.supportingCopy || ''}
                      onChange={(e) => updateActiveSectionConfig('supportingCopy', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <ImageUploadField
                    label="Editorial Showcase Image"
                    value={activeSection.config?.mediaUrl || ''}
                    onChange={(url) => updateActiveSectionConfig('mediaUrl', url)}
                  />

                  {/* Dynamic Product Rail Integration */}
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '16px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                          Featured Catalog Products Rail
                        </span>
                        <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0' }}>
                          Connects directly to actual live products from your catalog.
                        </p>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={activeSection.config?.showProductRail || false}
                          onChange={(e) => updateActiveSectionConfig('showProductRail', e.target.checked)}
                        />
                        Enable Rail
                      </label>
                    </div>

                    {activeSection.config?.showProductRail && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Rail Header Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SHOP THE ICONIC SILHOUETTES"
                            value={activeSection.config?.railHeading || ''}
                            onChange={(e) => updateActiveSectionConfig('railHeading', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                              Catalog Source
                            </label>
                            <select
                              value={activeSection.config?.productRailSource || 'auto'}
                              onChange={(e) => updateActiveSectionConfig('productRailSource', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                              <option value="auto">Auto (Top Published Products)</option>
                              <option value="collection">Filter by Collection</option>
                              <option value="category">Filter by Category</option>
                            </select>
                          </div>

                          {activeSection.config?.productRailSource === 'collection' && (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                Select Collection
                              </label>
                              <select
                                value={activeSection.config?.collectionSlug || ''}
                                onChange={(e) => updateActiveSectionConfig('collectionSlug', e.target.value)}
                                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              >
                                <option value="">-- Choose Collection --</option>
                                {catalog.collections.map((col) => (
                                  <option key={col._id} value={col.slug}>
                                    {col.name} ({col.slug})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {activeSection.config?.productRailSource === 'category' && (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                Select Category
                              </label>
                              <select
                                value={activeSection.config?.categoryId || ''}
                                onChange={(e) => updateActiveSectionConfig('categoryId', e.target.value)}
                                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              >
                                <option value="">-- Choose Category --</option>
                                {catalog.categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION F — MANUFACTURING PROCESS */}
              {activeSection.sectionType === 'manufacturing' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. THE PRODUCTION BLUEPRINT"
                        value={activeSection.config?.heading || ''}
                        onChange={(e) => updateActiveSectionConfig('heading', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Layout Template
                      </label>
                      <select
                        value={activeSection.config?.layoutVariant || 'grid'}
                        onChange={(e) => updateActiveSectionConfig('layoutVariant', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="grid">Multi-Column Stage Grid</option>
                        <option value="vertical_step">Vertical Step Flow</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      Manufacturing Stages ({(activeSection.config?.stages || []).length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = activeSection.config?.stages || [];
                        const newStage = {
                          id: 'stage_' + Date.now(),
                          title: '',
                          description: '',
                          mediaUrl: '',
                          stepNumber: current.length + 1,
                          displayOrder: current.length,
                          isEnabled: true,
                        };
                        updateActiveSectionConfig('stages', [...current, newStage]);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={14} /> Add Stage
                    </button>
                  </div>

                  {(activeSection.config?.stages || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '0.84rem' }}>
                        No stages configured. Add confirmed manufacturing steps only when verified. If empty, section will not be displayed on storefront.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(activeSection.config?.stages || []).map((stg, stgIdx) => (
                        <div
                          key={stg.id || stgIdx}
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                              Stage #{stg.stepNumber || stgIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (activeSection.config?.stages || []).filter((_, i) => i !== stgIdx);
                                updateActiveSectionConfig('stages', copy);
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Step #</label>
                              <input
                                type="number"
                                value={stg.stepNumber || stgIdx + 1}
                                onChange={(e) => {
                                  const copy = [...(activeSection.config?.stages || [])];
                                  copy[stgIdx].stepNumber = Number(e.target.value);
                                  updateActiveSectionConfig('stages', copy);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Stage Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Closed-Cell Polymer Formulation"
                                value={stg.title || ''}
                                onChange={(e) => {
                                  const copy = [...(activeSection.config?.stages || [])];
                                  copy[stgIdx].title = e.target.value;
                                  updateActiveSectionConfig('stages', copy);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Description</label>
                            <textarea
                              rows={2}
                              placeholder="Detail the stage..."
                              value={stg.description || ''}
                              onChange={(e) => {
                                const copy = [...(activeSection.config?.stages || [])];
                                copy[stgIdx].description = e.target.value;
                                updateActiveSectionConfig('stages', copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                          </div>

                          <ImageUploadField
                            label="Stage Photography / Media"
                            value={stg.mediaUrl || ''}
                            onChange={(url) => {
                              const copy = [...(activeSection.config?.stages || [])];
                              copy[stgIdx].mediaUrl = url;
                              updateActiveSectionConfig('stages', copy);
                            }}
                            compact={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION G — CLOSING BRAND STATEMENT */}
              {activeSection.sectionType === 'closing_statement' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Main Statement (Bold Typography)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. STEP INTO WEIGHTLESS CLOUD COMFORT"
                      value={activeSection.config?.mainStatement || ''}
                      onChange={(e) => updateActiveSectionConfig('mainStatement', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Supporting Text
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Final brand sign-off or closing thought..."
                      value={activeSection.config?.supportingText || ''}
                      onChange={(e) => updateActiveSectionConfig('supportingText', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <ImageUploadField
                      label="Desktop Background Image"
                      value={activeSection.config?.desktopImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('desktopImageUrl', url)}
                    />
                    <ImageUploadField
                      label="Mobile Background Image"
                      value={activeSection.config?.mobileImageUrl || ''}
                      onChange={(url) => updateActiveSectionConfig('mobileImageUrl', url)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SHOP ALL SILHOUETTES"
                        value={activeSection.config?.ctaLabel || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLabel', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        CTA Link Destination
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /shop"
                        value={activeSection.config?.ctaLink || ''}
                        onChange={(e) => updateActiveSectionConfig('ctaLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Theme
                      </label>
                      <select
                        value={activeSection.config?.backgroundTheme || 'ink_black'}
                        onChange={(e) => updateActiveSectionConfig('backgroundTheme', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="ink_black">Ink Black (Deep Charcoal)</option>
                        <option value="warm_cream">Warm Cream</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Accent Color
                      </label>
                      <input
                        type="text"
                        placeholder="#d8ff00"
                        value={activeSection.config?.accentColor || '#d8ff00'}
                        onChange={(e) => updateActiveSectionConfig('accentColor', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Add Story Section
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  Select an editorial section template to append to your story page.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SECTION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.type}
                  onClick={() => handleAddSection(tmpl)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.background = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                      {tmpl.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      {tmpl.description}
                    </p>
                  </div>
                  <button
                    style={{
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setConfirmDeleteModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '20px' }}>
              Are you sure you want to remove this section from your story draft? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setConfirmDeleteModal(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSection(confirmDeleteModal)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
