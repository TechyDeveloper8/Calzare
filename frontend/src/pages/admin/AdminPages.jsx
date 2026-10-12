import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'info',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adminGetPages();
      if (res.success) {
        setPages(res.pages || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load CMS pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      setForm({
        title: page.title,
        slug: page.slug,
        category: page.category || 'info',
        content: page.content || '',
        excerpt: page.excerpt || '',
        metaTitle: page.metaTitle || page.title,
        metaDescription: page.metaDescription || '',
        isPublished: page.isPublished !== false,
      });
    } else {
      setEditingPage(null);
      setForm({
        title: '',
        slug: '',
        category: 'info',
        content: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        isPublished: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingPage) {
        await api.adminUpdatePage(editingPage._id, form);
      } else {
        await api.adminCreatePage(form);
      }
      setModalOpen(false);
      fetchPages();
    } catch (err) {
      alert(err.message || 'Failed to save CMS page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete page "${title}"?`)) return;
    try {
      await api.adminDeletePage(id);
      fetchPages();
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CMS Pages & Brand Policies</h1>
          <p className="admin-page-subtitle">
            Create editorial pages, about us, shoe sizing charts, shipping & return terms, and privacy policies
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openModal()} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Create Page
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Pages Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading pages...</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No CMS pages found</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
              Create pages like About Us, Shipping Policy, or Terms of Service
            </p>
            <button onClick={() => openModal()} className="admin-btn admin-btn-primary">
              Create First Page
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>URL Route</th>
                  <th>Category</th>
                  <th>Last Modified</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.title}</div>
                      {p.excerpt && (
                        <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                          {p.excerpt}
                        </div>
                      )}
                    </td>
                    <td>
                      <a
                        href={`/page/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: '#333', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        /page/{p.slug} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', background: '#eee', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#666' }}>
                      {new Date(p.updatedAt || p.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      {p.isPublished ? (
                        <span className="status-badge status-delivered">Published</span>
                      ) : (
                        <span className="status-badge status-pending">Draft</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openModal(p)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.title)}
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

      {/* Page Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New CMS Page'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">Page Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shipping & Return Policy"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="admin-select"
                  >
                    <option value="info">Brand & Info</option>
                    <option value="legal">Legal & Policy</option>
                    <option value="help">Support & FAQ</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Custom Slug (optional, defaults to title)</label>
                <input
                  type="text"
                  placeholder="e.g. shipping-returns"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Short Excerpt / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Everything you need to know about delivery timelines and exchange process"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="admin-label">Page Content (Markdown / HTML supported)</label>
                <textarea
                  rows={10}
                  required
                  placeholder="Write your policy or story here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="admin-textarea"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="admin-label">SEO Meta Title</label>
                  <input
                    type="text"
                    placeholder="Defaults to page title"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">SEO Meta Description</label>
                  <input
                    type="text"
                    placeholder="Short description for search engines"
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  Publish page immediately to live storefront
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
