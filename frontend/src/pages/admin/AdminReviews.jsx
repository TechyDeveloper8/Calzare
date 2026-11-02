import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../api/api.js';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
  Filter,
  Search,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
  Edit2,
  X,
  MessageSquare,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField.jsx';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Adding/Editing Reviews
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    rating: 5,
    title: '',
    comment: '',
    verifiedPurchase: true,
    status: 'approved',
    isFeatured: false,
    imageUrl: '',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [revRes, prodRes] = await Promise.all([
        api.adminGetReviews(),
        api.getProducts({ limit: 150 }).catch(() => ({ products: [] })),
      ]);

      if (revRes.success) {
        setReviews(revRes.reviews || []);
      }
      if (prodRes && prodRes.products) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setForm({
      productId: products[0]?._id || '',
      customerName: '',
      customerEmail: '',
      rating: 5,
      title: '',
      comment: '',
      verifiedPurchase: true,
      status: 'approved',
      isFeatured: false,
      imageUrl: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rev) => {
    setEditingReview(rev);
    setForm({
      productId: rev.product?._id || rev.product || '',
      customerName: rev.customerName || '',
      customerEmail: rev.customerEmail || '',
      rating: rev.rating || 5,
      title: rev.title || '',
      comment: rev.comment || '',
      verifiedPurchase: rev.verifiedPurchase !== false,
      status: rev.status || 'approved',
      isFeatured: Boolean(rev.isFeatured),
      imageUrl: rev.images?.[0] || '',
      createdAt: rev.createdAt
        ? new Date(rev.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.adminUpdateReview(id, { status: newStatus });
      if (res.success) {
        setReviews(reviews.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      }
    } catch (err) {
      alert(err.message || 'Failed to update review status');
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await api.adminUpdateReview(id, { isFeatured: !currentFeatured });
      if (res.success) {
        setReviews(reviews.map((r) => (r._id === id ? { ...r, isFeatured: !currentFeatured } : r)));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.adminDeleteReview(id);
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      setFormError('Please select a product for this review.');
      return;
    }
    if (!form.customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!form.comment.trim()) {
      setFormError('Review comment text is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        productId: form.productId,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        rating: Number(form.rating) || 5,
        title: form.title.trim(),
        comment: form.comment.trim(),
        verifiedPurchase: Boolean(form.verifiedPurchase),
        status: form.status,
        isFeatured: Boolean(form.isFeatured),
        images: form.imageUrl ? [form.imageUrl] : [],
        createdAt: form.createdAt ? new Date(form.createdAt).toISOString() : undefined,
      };

      if (editingReview) {
        const res = await api.adminUpdateReview(editingReview._id, payload);
        if (res.success && res.review) {
          setReviews((prev) => prev.map((r) => (r._id === editingReview._id ? res.review : r)));
          setIsModalOpen(false);
          setEditingReview(null);
        }
      } else {
        const res = await api.adminCreateReview(payload);
        if (res.success && res.review) {
          setReviews((prev) => [res.review, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = r.customerName?.toLowerCase().includes(q);
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchProduct = r.product?.name?.toLowerCase().includes(q);
      return matchName || matchComment || matchTitle || matchProduct;
    }
    return true;
  });

  // KPI Metrics
  const totalApproved = reviews.filter((r) => r.status === 'approved').length;
  const totalFeatured = reviews.filter((r) => r.isFeatured).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  const selectedProduct = products.find((p) => p._id === form.productId);

  return (
    <div>
      {/* Page Header with Action Button */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Reviews Moderation & Management</h1>
          <p className="admin-page-subtitle">
            Add authentic customer feedback, curate verified buyer reviews, and feature top praise on the storefront
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="admin-btn admin-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Plus size={16} /> Add Customer Review
        </button>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div className="admin-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{reviews.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Reviews</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{totalApproved}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Live & Approved</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={20} fill="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{avgRating} / 5.0</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Average Score</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{totalFeatured}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Featured on Homepage</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by customer name, comment, title, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>Status:</span>
            {['all', 'approved', 'pending', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`admin-btn ${statusFilter === st ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '5px 12px', textTransform: 'capitalize' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading customer reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Star size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No reviews found</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '16px' }}>
              No customer reviews match your filter, or none have been created yet.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="admin-btn admin-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Add First Customer Review
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Details</th>
                  <th>Homepage Feature</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => (
                  <tr key={rev._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rev.product?.defaultImages?.[0]?.url && (
                          <img
                            src={getAssetUrl(rev.product.defaultImages[0].url)}
                            alt=""
                            style={{
                              width: '36px',
                              height: '36px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              background: '#f8fafc',
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {rev.product?.name || 'Footwear Product'}
                          </div>
                          {rev.product?.slug && (
                            <a
                              href={`/product/${rev.product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'underline' }}
                            >
                              View PDP
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rev.customerName}</div>
                      {rev.customerEmail && (
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{rev.customerEmail}</div>
                      )}
                      {rev.verifiedPurchase && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            marginTop: '2px',
                          }}
                        >
                          <ShieldCheck size={10} /> Verified Buyer
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            fill={s <= rev.rating ? '#ffb800' : 'none'}
                            color={s <= rev.rating ? '#ffb800' : '#ccc'}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {rev.title && <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>"{rev.title}"</div>}
                      <p style={{ fontSize: '0.8rem', color: '#555', margin: '2px 0 6px', lineHeight: '1.4' }}>
                        {rev.comment}
                      </p>
                      {rev.images && rev.images.length > 0 && rev.images[0] && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <img
                            src={getAssetUrl(rev.images[0])}
                            alt="Customer photo"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              border: '1px solid #cbd5e1',
                            }}
                          />
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Photo attached</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(rev._id, rev.isFeatured)}
                        className="admin-btn admin-btn-outline"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          background: rev.isFeatured ? '#eff6ff' : 'transparent',
                          color: rev.isFeatured ? '#1d4ed8' : '#64748b',
                          borderColor: rev.isFeatured ? '#bfdbfe' : '#e2e8f0',
                          fontWeight: rev.isFeatured ? 600 : 500,
                        }}
                      >
                        <Sparkles size={12} /> {rev.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                    </td>
                    <td>
                      {rev.status === 'approved' ? (
                        <span className="status-badge status-delivered">Approved</span>
                      ) : rev.status === 'rejected' ? (
                        <span className="status-badge status-cancelled">Rejected</span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(rev)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
                          title="Edit Review Details"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        {rev.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(rev._id, 'approved')}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#16a34a', borderColor: '#86efac' }}
                            title="Approve Review"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(rev._id, 'rejected')}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#ea580c', borderColor: '#fdba74' }}
                            title="Reject Review"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 6px', color: '#dc2626', borderColor: '#fca5a5' }}
                          title="Delete Review"
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

      {/* Review Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => !saving && setIsModalOpen(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  {editingReview ? 'Edit Customer Review' : 'Add Customer Review'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Curate genuine reviews with star rating, verified buyer badge, and storefront features
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              {/* Product Assignment */}
              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">
                  Assigned Silhouette / Product <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="admin-select"
                  style={{ fontSize: '0.84rem' }}
                >
                  <option value="" disabled>
                    -- Select Footwear Product --
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''} — {p.audience || 'Footwear'}
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {selectedProduct.defaultImages?.[0]?.url && (
                      <img
                        src={getAssetUrl(selectedProduct.defaultImages[0].url)}
                        alt=""
                        style={{
                          width: '32px',
                          height: '32px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedProduct.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        ₹{(selectedProduct.baseSalePrice || selectedProduct.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">
                    Customer Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Verma"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Customer Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. rohit.v@example.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Star Rating Interactive Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label className="admin-label">
                  Star Rating <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, rating: s })}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Star
                          size={26}
                          fill={s <= form.rating ? '#f59e0b' : 'none'}
                          color={s <= form.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                    {form.rating === 5 && '5 Stars — Outstanding (Recommended)'}
                    {form.rating === 4 && '4 Stars — Very Good'}
                    {form.rating === 3 && '3 Stars — Average'}
                    {form.rating === 2 && '2 Stars — Below Average'}
                    {form.rating === 1 && '1 Star — Poor'}
                  </span>
                </div>
              </div>

              {/* Review Title & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">Review Title / Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Incredibly soft sole, arch support is real!"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Review Date</label>
                  <input
                    type="date"
                    value={form.createdAt}
                    onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Review Comment / Feedback */}
              <div style={{ marginBottom: '16px' }}>
                <label className="admin-label">
                  Review Text / Comment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail customer thoughts on sizing, comfort, cushioning, wet terrain grip, etc..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="admin-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Customer Photo Upload */}
              <div style={{ marginBottom: '16px' }}>
                <ImageUploadField
                  label="Customer Review Photo (Optional)"
                  description="Upload a photo from the customer (unboxing, lifestyle, or wearing silhouette)"
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  compact={true}
                  previewHeight={90}
                  objectFit="contain"
                />
              </div>

              {/* Toggles: Verified Buyer & Feature on Homepage */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.verifiedPurchase}
                    onChange={(e) => setForm({ ...form, verifiedPurchase: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} color="#16a34a" /> Verified Buyer Badge
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Shows green verified badge</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} color="#9333ea" /> Feature on Homepage
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Appears in homepage review carousel</div>
                  </div>
                </label>
              </div>

              {/* Status Select */}
              <div style={{ marginBottom: '20px' }}>
                <label className="admin-label">Moderation Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="admin-select"
                  style={{ fontSize: '0.84rem' }}
                >
                  <option value="approved">Approved (Live on Storefront & PDP)</option>
                  <option value="pending">Pending (Awaiting Moderation)</option>
                  <option value="rejected">Rejected (Hidden from Storefront)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                  style={{ gap: '6px' }}
                >
                  {saving ? 'Saving Review...' : editingReview ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
