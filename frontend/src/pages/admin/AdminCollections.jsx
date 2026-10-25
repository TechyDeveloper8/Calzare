import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Layers,
  FolderPlus,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Tag,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';

export const AdminCollections = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'collections'
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  });

  // Collection Modal State
  const [colModalOpen, setColModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState(null);
  const [colForm, setColForm] = useState({
    name: '',
    description: '',
    bannerImage: '',
    ruleType: 'manual', // 'manual' | 'price_under' | 'audience_match'
    ruleValue: '',
    isPublished: true,
    isFeaturedOnHome: false,
    displayOrder: 0,
    hero: {
      label: "THE MEN'S EDIT",
      heading: 'BUILT TO STAND OUT.',
      supportingText: 'Everyday comfort. Zero ordinary energy.',
      desktopBannerUrl: '',
      mobileBannerUrl: '',
      imagePosition: 'center center',
      background: 'editorial_minimal',
      ctaText: 'EXPLORE DROP',
      ctaLink: '#collection-grid',
      isVisible: true,
    },
    editorialBanner: {
      isEnabled: false,
      eyebrow: '',
      heading: '',
      bodyText: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
    },
    seoTitle: '',
    seoDescription: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [catRes, colRes] = await Promise.all([
        api.adminGetCategories(),
        api.adminGetCollections(),
      ]);
      if (catRes.success) setCategories(catRes.categories || []);
      if (colRes.success) setCollections(colRes.collections || []);
    } catch (err) {
      setError(err.message || 'Failed to load catalog taxonomy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Handlers
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name,
        description: cat.description || '',
        image: cat.image || '',
        displayOrder: cat.displayOrder || 0,
        isActive: cat.isActive !== false,
      });
    } else {
      setEditingCat(null);
      setCatForm({
        name: '',
        description: '',
        image: '',
        displayOrder: categories.length,
        isActive: true,
      });
    }
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCat) {
        await api.adminUpdateCategory(editingCat._id, catForm);
      } else {
        await api.adminCreateCategory(catForm);
      }
      setCatModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCatDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.adminDeleteCategory(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Cannot delete category');
    }
  };

  // Collection Handlers
  const openColModal = (col = null) => {
    if (col) {
      setEditingCol(col);
      setColForm({
        name: col.name,
        description: col.description || '',
        bannerImage: col.bannerImage || '',
        ruleType: col.ruleType || 'manual',
        ruleValue: col.ruleValue || '',
        isPublished: col.isPublished !== false,
        isFeaturedOnHome: !!col.isFeaturedOnHome,
        displayOrder: col.displayOrder || 0,
        hero: {
          label: col.hero?.label || "THE MEN'S EDIT",
          heading: col.hero?.heading || 'BUILT TO STAND OUT.',
          supportingText: col.hero?.supportingText || 'Everyday comfort. Zero ordinary energy.',
          desktopBannerUrl: col.hero?.desktopBannerUrl || '',
          mobileBannerUrl: col.hero?.mobileBannerUrl || '',
          imagePosition: col.hero?.imagePosition || 'center center',
          background: col.hero?.background || 'editorial_minimal',
          ctaText: col.hero?.ctaText || 'EXPLORE DROP',
          ctaLink: col.hero?.ctaLink || '#collection-grid',
          isVisible: col.hero?.isVisible !== false,
        },
        editorialBanner: {
          isEnabled: !!col.editorialBanner?.isEnabled,
          eyebrow: col.editorialBanner?.eyebrow || '',
          heading: col.editorialBanner?.heading || '',
          bodyText: col.editorialBanner?.bodyText || '',
          imageUrl: col.editorialBanner?.imageUrl || '',
          ctaText: col.editorialBanner?.ctaText || '',
          ctaLink: col.editorialBanner?.ctaLink || '',
        },
        seoTitle: col.seoTitle || '',
        seoDescription: col.seoDescription || '',
      });
    } else {
      setEditingCol(null);
      setColForm({
        name: '',
        description: '',
        bannerImage: '',
        ruleType: 'manual',
        ruleValue: '',
        isPublished: true,
        isFeaturedOnHome: false,
        displayOrder: collections.length,
        hero: {
          label: "THE MEN'S EDIT",
          heading: 'BUILT TO STAND OUT.',
          supportingText: 'Everyday comfort. Zero ordinary energy.',
          desktopBannerUrl: '',
          mobileBannerUrl: '',
          imagePosition: 'center center',
          background: 'editorial_minimal',
          ctaText: 'EXPLORE DROP',
          ctaLink: '#collection-grid',
          isVisible: true,
        },
        editorialBanner: {
          isEnabled: false,
          eyebrow: '',
          heading: '',
          bodyText: '',
          imageUrl: '',
          ctaText: '',
          ctaLink: '',
        },
        seoTitle: '',
        seoDescription: '',
      });
    }
    setColModalOpen(true);
  };

  const handleColSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCol) {
        await api.adminUpdateCollection(editingCol._id, colForm);
      } else {
        await api.adminCreateCollection(colForm);
      }
      setColModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleColDelete = async (id, name) => {
    if (!window.confirm(`Delete collection "${name}"?`)) return;
    try {
      await api.adminDeleteCollection(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Cannot delete collection');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories & Collections</h1>
          <p className="admin-page-subtitle">
            Manage footwear taxonomy, curated drops, and dynamic rule-based pricing stores (Under ₹999)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'categories' ? (
            <button onClick={() => openCatModal()} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
              <Plus size={16} /> New Category
            </button>
          ) : (
            <button onClick={() => openColModal()} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
              <Plus size={16} /> New Collection
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'categories' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'categories' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Layers size={16} style={{ display: 'inline', marginRight: '6px' }} /> Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'collections' ? '2px solid var(--ink-black)' : '2px solid transparent',
            color: activeTab === 'collections' ? 'var(--ink-black)' : '#888',
          }}
        >
          <Sparkles size={16} style={{ display: 'inline', marginRight: '6px' }} /> Collections & Drops ({collections.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' ? (
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No categories created yet</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Layers size={18} color="#999" />
                            </div>
                          )}
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat.name}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', color: '#666' }}>/shop?category={cat.slug}</code>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#777', maxWidth: '300px' }}>
                        {cat.description || '—'}
                      </td>
                      <td>{cat.displayOrder}</td>
                      <td>
                        {cat.isActive ? (
                          <span className="status-badge status-delivered">Active</span>
                        ) : (
                          <span className="status-badge status-cancelled">Inactive</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => openCatModal(cat)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleCatDelete(cat._id, cat.name)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Collections Tab */
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading collections...</div>
          ) : collections.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No collections created yet</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th>Slug</th>
                    <th>Rule Engine</th>
                    <th>Featured on Home</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr key={col._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {col.bannerImage ? (
                            <img
                              src={col.bannerImage}
                              alt={col.name}
                              style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                          ) : (
                            <div style={{ width: '48px', height: '36px', borderRadius: '4px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Sparkles size={16} color="#999" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{col.name}</div>
                            {col.description && (
                              <div style={{ fontSize: '0.75rem', color: '#777' }}>{col.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`/collection/${col.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.8rem', color: '#333', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          /collection/{col.slug} <ExternalLink size={11} />
                        </a>
                      </td>
                      <td>
                        {col.ruleType === 'price_under' ? (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.74rem' }}>
                            Auto: Under ₹{col.ruleValue || 999}
                          </span>
                        ) : (
                          <span style={{ background: '#eee', padding: '3px 8px', borderRadius: '3px', fontWeight: 600, fontSize: '0.75rem' }}>
                            Manual Selection
                          </span>
                        )}
                      </td>
                      <td>
                        {col.isFeaturedOnHome ? (
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.8rem' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.8rem' }}>No</span>
                        )}
                      </td>
                      <td>
                        {col.isPublished ? (
                          <span className="status-badge status-delivered">Published</span>
                        ) : (
                          <span className="status-badge status-pending">Draft</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => openColModal(col)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleColDelete(col._id, col.name)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {catModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setCatModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                {editingCat ? `Edit Category: ${editingCat.name}` : 'New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCatSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Streetwear Chunky"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short tagline for category header"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <ImageUploadField
                  label="Category Thumbnail Image"
                  description="Directly upload visual icon/photo for this category"
                  value={catForm.image}
                  onChange={(url) => setCatForm({ ...catForm, image: url })}
                  aspectRatio="square"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="admin-label">Display Order</label>
                  <input
                    type="number"
                    value={catForm.displayOrder}
                    onChange={(e) => setCatForm({ ...catForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="admin-input"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={catForm.isActive}
                      onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                    />
                    Active in storefront
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setCatModalOpen(false)} className="admin-btn admin-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collection Add/Edit Modal */}
      {colModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setColModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'sticky', top: 0, background: '#ffffff', zIndex: 10, paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                  {editingCol ? `Edit Collection: ${editingCol.name}` : 'New Collection / Drop'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Configure collection taxonomy, editorial hero banner, and SEO
                </span>
              </div>
              <button onClick={() => setColModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleColSubmit}>
              {/* Basic Information */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a', marginBottom: '12px' }}>
                  Basic Information & Rules
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">Collection Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MEN'S FOOTWEAR EDIT"
                      value={colForm.name}
                      onChange={(e) => setColForm({ ...colForm, name: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">Inclusion Rule Type</label>
                    <select
                      value={colForm.ruleType}
                      onChange={(e) => setColForm({ ...colForm, ruleType: e.target.value })}
                      className="admin-select"
                    >
                      <option value="audience_match">Audience (Men, Women, Kids, Unisex)</option>
                      <option value="price_under">Dynamic: Price &le; Value (e.g. Under ₹999)</option>
                      <option value="manual">Manual Products Tagging</option>
                    </select>
                  </div>
                </div>

                {colForm.ruleType === 'audience_match' && (
                  <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                    <label className="admin-label">Target Audience Filter</label>
                    <select
                      value={colForm.ruleValue || 'Men'}
                      onChange={(e) => setColForm({ ...colForm, ruleValue: e.target.value })}
                      className="admin-select"
                    >
                      <option value="Men">Men (Includes Men + Unisex styles)</option>
                      <option value="Women">Women (Includes Women + Unisex styles)</option>
                      <option value="Kids">Kids</option>
                      <option value="Unisex">Unisex Only</option>
                    </select>
                  </div>
                )}

                {colForm.ruleType === 'price_under' && (
                  <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                    <label className="admin-label">Max Price Threshold (₹)</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={colForm.ruleValue}
                      onChange={(e) => setColForm({ ...colForm, ruleValue: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                )}

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Collection Summary Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description for collection header"
                    value={colForm.description}
                    onChange={(e) => setColForm({ ...colForm, description: e.target.value })}
                    className="admin-textarea"
                  />
                </div>
              </div>

              {/* SolaWorld Editorial Hero Banner */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color="#0f172a" /> Editorial Collection Hero
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={colForm.hero?.isVisible !== false}
                      onChange={(e) =>
                        setColForm({
                          ...colForm,
                          hero: { ...colForm.hero, isVisible: e.target.checked },
                        })
                      }
                    />
                    Display Hero Banner
                  </label>
                </div>

                {colForm.hero?.isVisible !== false && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Hero Label / Eyebrow</label>
                        <input
                          type="text"
                          placeholder="e.g. THE MEN'S EDIT"
                          value={colForm.hero?.label || ''}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              hero: { ...colForm.hero, label: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Hero Headline</label>
                        <input
                          type="text"
                          placeholder="e.g. BUILT TO STAND OUT."
                          value={colForm.hero?.heading || ''}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              hero: { ...colForm.hero, heading: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="admin-label">Supporting Copy</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Everyday comfort. Zero ordinary energy."
                        value={colForm.hero?.supportingText || ''}
                        onChange={(e) =>
                          setColForm({
                            ...colForm,
                            hero: { ...colForm.hero, supportingText: e.target.value },
                          })
                        }
                        className="admin-textarea"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <ImageUploadField
                        label="Desktop Hero Image"
                        description="Wide editorial banner (1600x600 recommended)"
                        value={colForm.hero?.desktopBannerUrl || ''}
                        onChange={(url) =>
                          setColForm({
                            ...colForm,
                            hero: { ...colForm.hero, desktopBannerUrl: url },
                          })
                        }
                        aspectRatio="banner"
                        compact={true}
                      />
                      <ImageUploadField
                        label="Mobile Hero Image (Optional)"
                        description="Portrait optimized crop for mobile screens"
                        value={colForm.hero?.mobileBannerUrl || ''}
                        onChange={(url) =>
                          setColForm({
                            ...colForm,
                            hero: { ...colForm.hero, mobileBannerUrl: url },
                          })
                        }
                        aspectRatio="square"
                        compact={true}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Image Focal Point</label>
                        <select
                          value={colForm.hero?.imagePosition || 'center center'}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              hero: { ...colForm.hero, imagePosition: e.target.value },
                            })
                          }
                          className="admin-select"
                        >
                          <option value="center center">Center Middle</option>
                          <option value="center bottom">Center Bottom</option>
                          <option value="center top">Center Top</option>
                        </select>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Background Aesthetic</label>
                        <select
                          value={colForm.hero?.background || 'editorial_minimal'}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              hero: { ...colForm.hero, background: e.target.value },
                            })
                          }
                          className="admin-select"
                        >
                          <option value="editorial_minimal">Editorial Minimal (Off-White)</option>
                          <option value="warm_cream">Warm Cream</option>
                          <option value="dark_canvas">Ink Black Canvas</option>
                        </select>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">CTA Label</label>
                        <input
                          type="text"
                          placeholder="e.g. EXPLORE DROP"
                          value={colForm.hero?.ctaText || ''}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              hero: { ...colForm.hero, ctaText: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Optional Post-Grid Editorial Section */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                    Optional Post-Grid Story Banner
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!colForm.editorialBanner?.isEnabled}
                      onChange={(e) =>
                        setColForm({
                          ...colForm,
                          editorialBanner: { ...colForm.editorialBanner, isEnabled: e.target.checked },
                        })
                      }
                    />
                    Enable Brand Story Section
                  </label>
                </div>

                {colForm.editorialBanner?.isEnabled && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Eyebrow / Subhead</label>
                        <input
                          type="text"
                          placeholder="e.g. ARCHITECTURE & MOVEMENT"
                          value={colForm.editorialBanner?.eyebrow || ''}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              editorialBanner: { ...colForm.editorialBanner, eyebrow: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Heading</label>
                        <input
                          type="text"
                          placeholder="e.g. BUILT DIFFERENT FOR THE CITY TRENCHES."
                          value={colForm.editorialBanner?.heading || ''}
                          onChange={(e) =>
                            setColForm({
                              ...colForm,
                              editorialBanner: { ...colForm.editorialBanner, heading: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="admin-label">Body Text</label>
                      <textarea
                        rows={2}
                        value={colForm.editorialBanner?.bodyText || ''}
                        onChange={(e) =>
                          setColForm({
                            ...colForm,
                            editorialBanner: { ...colForm.editorialBanner, bodyText: e.target.value },
                          })
                        }
                        className="admin-textarea"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <ImageUploadField
                        label="Story Banner Image"
                        description="Lifestyle photography"
                        value={colForm.editorialBanner?.imageUrl || ''}
                        onChange={(url) =>
                          setColForm({
                            ...colForm,
                            editorialBanner: { ...colForm.editorialBanner, imageUrl: url },
                          })
                        }
                        aspectRatio="banner"
                        compact={true}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Button Label</label>
                          <input
                            type="text"
                            placeholder="LEARN MORE"
                            value={colForm.editorialBanner?.ctaText || ''}
                            onChange={(e) =>
                              setColForm({
                                ...colForm,
                                editorialBanner: { ...colForm.editorialBanner, ctaText: e.target.value },
                              })
                            }
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Button Link</label>
                          <input
                            type="text"
                            placeholder="/about"
                            value={colForm.editorialBanner?.ctaLink || ''}
                            onChange={(e) =>
                              setColForm({
                                ...colForm,
                                editorialBanner: { ...colForm.editorialBanner, ctaLink: e.target.value },
                              })
                            }
                            className="admin-input"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SEO & Publication Status */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a', marginBottom: '12px' }}>
                  SEO & Publishing
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">SEO Meta Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Men's Footwear Edit | CALZARE"
                      value={colForm.seoTitle || ''}
                      onChange={(e) => setColForm({ ...colForm, seoTitle: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">SEO Meta Description</label>
                    <input
                      type="text"
                      placeholder="Short summary for Google search results"
                      value={colForm.seoDescription || ''}
                      onChange={(e) => setColForm({ ...colForm, seoDescription: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="admin-label">Display Order</label>
                    <input
                      type="number"
                      value={colForm.displayOrder}
                      onChange={(e) => setColForm({ ...colForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
                      className="admin-input"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={colForm.isPublished}
                        onChange={(e) => setColForm({ ...colForm, isPublished: e.target.checked })}
                      />
                      Published on Storefront
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={colForm.isFeaturedOnHome}
                        onChange={(e) => setColForm({ ...colForm, isFeaturedOnHome: e.target.checked })}
                      />
                      Feature on Home
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: '#ffffff', padding: '12px 0', borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
                <button type="button" onClick={() => setColModalOpen(false)} className="admin-btn admin-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
