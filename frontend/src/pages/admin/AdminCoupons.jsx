import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  IndianRupee,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 10,
    minOrderValue: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    validUntil: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adminGetCoupons();
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        usageLimit: coupon.usageLimit || '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        isActive: coupon.isActive !== false,
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 999,
        maxDiscountAmount: 500,
        usageLimit: 500,
        validUntil: '',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };

      if (editingCoupon) {
        await api.adminUpdateCoupon(editingCoupon._id, payload);
      } else {
        await api.adminCreateCoupon(payload);
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete promotional coupon "${code}"?`)) return;
    try {
      await api.adminDeleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Cannot delete coupon');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Promotional Discounts</h1>
          <p className="admin-page-subtitle">
            Create promotional coupon codes, percentage discounts, flat cart discounts, and cart limits
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openModal()} className="admin-btn admin-btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Coupons Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Tag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No active coupons</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
              Create discount codes like FIRST10 or STREET15 to drive conversions
            </p>
            <button onClick={() => openModal()} className="admin-btn admin-btn-primary">
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Cap</th>
                  <th>Usage</th>
                  <th>Expires On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                  return (
                    <tr key={coupon._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="corp-code" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                            {coupon.code}
                          </span>
                        </div>
                        {coupon.description && (
                          <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px' }}>
                            {coupon.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} FLAT OFF`}
                        </span>
                      </td>
                      <td>₹{coupon.minOrderValue || 0}</td>
                      <td>{coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : 'No limit'}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#555' }}>
                        {coupon.validUntil ? (
                          <span style={{ color: isExpired ? '#dc2626' : 'inherit' }}>
                            {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td>
                        {isExpired ? (
                          <span className="status-badge status-cancelled">Expired</span>
                        ) : coupon.isActive ? (
                          <span className="status-badge status-delivered">Active</span>
                        ) : (
                          <span className="status-badge status-pending">Inactive</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => openModal(coupon)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXTRA10, SUMMERVIBES"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="admin-input"
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="admin-label">Description (Customer visible tagline)</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off on all streetwear sneakers above ₹999"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="admin-select"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">
                    Discount Value {form.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="admin-label">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave blank for no cap"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="admin-label">Usage Limit (Max Redeems)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Expiry Date</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Coupon is active for checkout
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
