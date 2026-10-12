import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
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
} from 'lucide-react';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adminGetReviews();
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

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

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = r.customerName?.toLowerCase().includes(q);
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchProduct = r.product?.name?.toLowerCase().includes(q);
      return matchName || matchComment || matchProduct;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Reviews Moderation</h1>
          <p className="admin-page-subtitle">
            Moderate genuine customer feedback, verified buyer badges, and feature high-praise reviews on homepage
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by customer, comment text, or product name..."
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
            <p style={{ color: '#888', fontSize: '0.85rem' }}>No reviews match your current filter</p>
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
                            src={rev.product.defaultImages[0].url}
                            alt=""
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
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
                              style={{ fontSize: '0.7rem', color: '#666', textDecoration: 'underline' }}
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
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      {rev.title && <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rev.title}</div>}
                      <p style={{ fontSize: '0.8rem', color: '#555', margin: '2px 0 0', lineHeight: '1.4' }}>
                        {rev.comment}
                      </p>
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
    </div>
  );
};
