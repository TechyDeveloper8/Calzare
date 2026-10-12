import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Truck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  AlertCircle,
  Printer,
  ChevronRight,
  User,
  MapPin,
  CreditCard,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Status update form state
  const [updateStatus, setUpdateStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const query = {};
      if (searchTerm) query.search = searchTerm;
      if (statusFilter) query.status = statusFilter;
      const res = await api.adminGetOrders(query);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
    setCourierName(order.trackingInfo?.carrier || '');
    setTrackingNumber(order.trackingInfo?.trackingNumber || '');
    setUpdateMessage('');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      setUpdateMessage('');
      const payload = {
        orderStatus: updateStatus,
        carrier: courierName,
        trackingNumber: trackingNumber,
      };
      const res = await api.adminUpdateOrderStatus(selectedOrder._id, payload);
      if (res.success) {
        setUpdateMessage('Fulfillment status and tracking details recorded successfully');
        setSelectedOrder(res.order);
        setOrders(orders.map((o) => (o._id === res.order._id ? res.order : o)));
      }
    } catch (err) {
      setUpdateMessage(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setCancelling(true);
      const res = await api.adminCancelOrder(selectedOrder._id, { reason: cancelReason });
      if (res.success) {
        setCancelModalOpen(false);
        setCancelReason('');
        setSelectedOrder(res.order);
        setOrders(orders.map((o) => (o._id === res.order._id ? res.order : o)));
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
        return (
          <span className="corp-pill corp-pill-success">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      case 'shipped':
      case 'processing':
        return (
          <span className="corp-pill corp-pill-info">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      case 'cancelled':
        return (
          <span className="corp-pill corp-pill-danger">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      default:
        return (
          <span className="corp-pill corp-pill-warning">
            <span className="corp-pill-dot" /> {status || 'pending'}
          </span>
        );
    }
  };

  // Status Tab options
  const statusTabs = [
    { label: 'All Orders', val: '' },
    { label: 'Pending', val: 'pending' },
    { label: 'Confirmed', val: 'confirmed' },
    { label: 'Processing', val: 'processing' },
    { label: 'Shipped', val: 'shipped' },
    { label: 'Delivered', val: 'delivered' },
    { label: 'Cancelled', val: 'cancelled' },
  ];

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
            Orders & Fulfillment
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Track transactions, assign logistics providers, update AWB tracking, and manage fulfillment.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="admin-btn admin-btn-outline"
          style={{ fontSize: '0.8rem' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Orders
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Status Segmented Tabs */}
      <div className="admin-tabs">
        {statusTabs.map((t) => (
          <button
            key={t.val}
            className={`admin-tab ${statusFilter === t.val ? 'active' : ''}`}
            onClick={() => setStatusFilter(t.val)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search by Order #, customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
              />
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '8px 14px' }}>
              Search
            </button>
          </form>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                fetchOrders();
              }}
              className="admin-btn admin-btn-ghost"
              style={{ fontSize: '0.78rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* High-Density Orders Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
            Retrieving orders database...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <Package size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>
              No orders matching current query
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date & Time</th>
                  <th>Customer Information</th>
                  <th>Payment Mode</th>
                  <th>Total Amount</th>
                  <th>Fulfillment Status</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="corp-code" style={{ fontSize: '0.78rem' }}>
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.orderNumber, order._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}
                          title="Copy Order ID"
                        >
                          {copiedId === order._id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                        {order.shippingAddress?.fullName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {order.customerEmail || order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600, color: '#334155' }}>
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`corp-pill ${order.paymentStatus === 'paid' ? 'corp-pill-success' : 'corp-pill-warning'}`}
                          style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>{getStatusBadge(order.orderStatus)}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '5px 10px', fontSize: '0.74rem', gap: '4px' }}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Fulfillment Modal */}
      {modalOpen && selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-container"
            style={{ maxWidth: '840px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="corp-code" style={{ fontSize: '0.85rem' }}>
                  {selectedOrder.orderNumber}
                </span>
                {getStatusBadge(selectedOrder.orderStatus)}
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {/* Delivery & Payment 2-Col Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* Shipping Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#334155', marginBottom: '8px' }}>
                    <MapPin size={14} color="#2563eb" /> Delivery Address
                  </div>
                  <div style={{ fontSize: '0.78rem', lineHeight: '1.5', color: '#475569' }}>
                    <strong style={{ color: '#0f172a' }}>{selectedOrder.shippingAddress?.fullName}</strong><br />
                    {selectedOrder.shippingAddress?.addressLine1}<br />
                    {selectedOrder.shippingAddress?.addressLine2 && <>{selectedOrder.shippingAddress.addressLine2}<br /></>}
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}<br />
                    Phone: <span style={{ fontWeight: 600 }}>{selectedOrder.shippingAddress?.phone}</span>
                  </div>
                </div>

                {/* Payment Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#334155', marginBottom: '8px' }}>
                    <CreditCard size={14} color="#2563eb" /> Payment & Settlement
                  </div>
                  <div style={{ fontSize: '0.78rem', lineHeight: '1.5', color: '#475569' }}>
                    <div>Mode: <strong style={{ textTransform: 'uppercase', color: '#0f172a' }}>{selectedOrder.paymentMethod}</strong></div>
                    <div>Status: <strong style={{ textTransform: 'capitalize', color: selectedOrder.paymentStatus === 'paid' ? '#047857' : '#b45309' }}>{selectedOrder.paymentStatus}</strong></div>
                    {selectedOrder.paymentDetails?.razorpayPaymentId && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Razorpay Payment ID: <code className="corp-code" style={{ fontSize: '0.68rem' }}>{selectedOrder.paymentDetails.razorpayPaymentId}</code>
                      </div>
                    )}
                    {selectedOrder.appliedCoupon?.code && (
                      <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', fontSize: '0.72rem', borderRadius: '4px' }}>
                        Applied Coupon: <strong>{selectedOrder.appliedCoupon.code}</strong> (-₹{selectedOrder.appliedCoupon.discountAmount})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Order Line Items
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th>UK Size</th>
                        <th>SKU</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th style={{ textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{item.name}</div>
                                {item.colorName && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Color: {item.colorName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.74rem' }}>
                              UK {item.size}
                            </span>
                          </td>
                          <td>
                            <code className="corp-code" style={{ fontSize: '0.72rem' }}>{item.sku || 'N/A'}</code>
                          </td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>₹{item.price?.toLocaleString('en-IN')}</td>
                          <td>x{item.quantity}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', fontWeight: 500, fontSize: '0.78rem' }}>
                        <td colSpan={5} style={{ textAlign: 'right', color: '#64748b' }}>Subtotal:</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{selectedOrder.pricing?.subtotal?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      {selectedOrder.pricing?.discount > 0 && (
                        <tr style={{ background: '#f8fafc', color: '#047857', fontSize: '0.78rem' }}>
                          <td colSpan={5} style={{ textAlign: 'right' }}>Promo Discount:</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            -₹{selectedOrder.pricing?.discount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                      <tr style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                        <td colSpan={5} style={{ textAlign: 'right', color: '#64748b' }}>Shipping:</td>
                        <td style={{ textAlign: 'right' }}>
                          {selectedOrder.pricing?.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.pricing?.shippingFee}`}
                        </td>
                      </tr>
                      <tr style={{ background: '#f1f5f9', fontWeight: 700, fontSize: '0.88rem' }}>
                        <td colSpan={5} style={{ textAlign: 'right', color: '#0f172a' }}>Grand Total:</td>
                        <td style={{ textAlign: 'right', color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status & Fulfillment Controller */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="#2563eb" /> Logistics & Carrier Assignment
                </div>

                {updateMessage && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: updateMessage.includes('success') ? '#ecfdf5' : '#fef2f2',
                      color: updateMessage.includes('success') ? '#047857' : '#b91c1c',
                      border: `1px solid ${updateMessage.includes('success') ? '#a7f3d0' : '#fecaca'}`,
                      fontSize: '0.78rem',
                      marginBottom: '10px',
                    }}
                  >
                    {updateMessage}
                  </div>
                )}

                <form onSubmit={handleUpdateStatus}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label className="admin-label">Lifecycle Status</label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="admin-select"
                        disabled={selectedOrder.orderStatus === 'cancelled'}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Courier Partner</label>
                      <input
                        type="text"
                        placeholder="e.g. BlueDart, Delhivery, DTDC"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Air Waybill / Tracking #</label>
                      <input
                        type="text"
                        placeholder="e.g. BLD789123456"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {selectedOrder.orderStatus !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => setCancelModalOpen(true)}
                          style={{
                            color: '#b91c1c',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            textDecoration: 'underline',
                          }}
                        >
                          Cancel Order & Restore Inventory
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={updating || selectedOrder.orderStatus === 'cancelled'}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      {updating ? 'Saving...' : 'Update Fulfillment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                onClick={() => window.print()}
                className="admin-btn admin-btn-outline"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirm Modal */}
      {cancelModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setCancelModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title" style={{ color: '#b91c1c' }}>
                Cancel Order {selectedOrder?.orderNumber}?
              </span>
              <button onClick={() => setCancelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 14px', lineHeight: 1.5 }}>
                Cancelling this order will mark its status as Cancelled and automatically release all reserved items back into available inventory.
              </p>
              <form onSubmit={handleCancelOrder}>
                <div className="admin-form-group">
                  <label className="admin-label">Reason for Cancellation</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Customer requested cancellation prior to dispatch"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="admin-textarea"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(false)}
                    className="admin-btn admin-btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling}
                    className="admin-btn admin-btn-danger"
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
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
