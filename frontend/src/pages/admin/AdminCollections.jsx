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
    ruleType: 'manual', // 'manual' | 'price_under'
    ruleValue: '',
    isPublished: true,
    isFeaturedOnHome: false,
    displayOrder: 0,
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
                <label className="admin-label">Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  className="admin-input"
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
          <div className="admin-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                {editingCol ? `Edit Collection: ${editingCol.name}` : 'New Collection / Drop'}
              </h3>
              <button onClick={() => setColModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleColSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Under ₹999 Store, Midnight Drop"
                  value={colForm.name}
                  onChange={(e) => setColForm({ ...colForm, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Description</label>
                <textarea
                  rows={2}
                  placeholder="Promotional banner description"
                  value={colForm.description}
                  onChange={(e) => setColForm({ ...colForm, description: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={colForm.bannerImage}
                  onChange={(e) => setColForm({ ...colForm, bannerImage: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">Inclusion Rule Type</label>
                  <select
                    value={colForm.ruleType}
                    onChange={(e) => setColForm({ ...colForm, ruleType: e.target.value })}
                    className="admin-select"
                  >
                    <option value="manual">Manual Products Tagging</option>
                    <option value="price_under">Dynamic: Price &le; Value</option>
                  </select>
                </div>

                {colForm.ruleType === 'price_under' && (
                  <div>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="admin-label">Sort Order</label>
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
                    Published
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
