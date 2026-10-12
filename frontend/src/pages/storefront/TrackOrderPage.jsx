import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !emailOrPhone.trim()) {
      setError('Please provide both your order number and contact detail.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrder(null);
      const res = await api.trackOrder({
        orderNumber: orderNumber.trim(),
        emailOrPhone: emailOrPhone.trim(),
      });
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || 'Unable to locate order.');
      }
    } catch (err) {
      setError(err.message || 'No order matching those credentials could be found.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Payment Pending' },
      confirmed: { bg: '#e8f4fd', color: '#0d6efd', text: 'Order Confirmed' },
      processing: { bg: '#e2f0d9', color: '#2b7a0b', text: 'In Production / Packing' },
      shipped: { bg: 'var(--accent-lime)', color: 'var(--ink-black)', text: 'Dispatched via Air Courier' },
      delivered: { bg: '#d4edda', color: '#155724', text: 'Delivered at Doorstep' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Order Cancelled' },
    };
    const s = map[status] || { bg: '#f0f0f0', color: '#555', text: status };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: s.color,
          }}
        />
        {s.text}
      </span>
    );
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Header Breadcrumb / Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">ORDER LOOKUP // LIVE DISPATCH TELEMETRY</span>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
            }}
          >
            TRACK YOUR DROP
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '540px',
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            Enter your unique order number and verification contact to inspect real-time fulfillment, warehouse packing, and air courier dispatch.
          </p>
        </div>

        {/* Lookup Box */}
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
            marginBottom: '40px',
          }}
        >
          <form onSubmit={handleTrack}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}
                >
                  Order Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Package
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. CALZ-2026-A1B2C"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.98rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}
                >
                  Email or Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. anurag@calzare.com or 9876543210"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15,15,16,0.15)',
                      fontSize: '0.98rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#991b1b',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                'Querying Fulfillment Central...'
              ) : (
                <>
                  Locate Shipment <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Order Detail & Telemetry View */}
        {order && (
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              borderRadius: 'var(--radius-xl)',
              background: '#ffffff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid rgba(15,15,16,0.08)',
                paddingBottom: '24px',
                marginBottom: '28px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Fulfillment Record
                </span>
                <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{order.orderNumber}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <Calendar size={14} />
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div>{getStatusBadge(order.orderStatus)}</div>
            </div>

            {/* Courier Tracking Callout if Shipped */}
            {order.trackingInfo?.trackingNumber && (
              <div
                style={{
                  background: 'var(--surface-cream)',
                  border: '1px solid rgba(15,15,16,0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '32px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--ink-black)',
                      color: 'var(--accent-lime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Courier Partner: {order.trackingInfo.carrier || order.trackingInfo.courierName || 'BlueDart Express'}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      AWB #{order.trackingInfo.trackingNumber}
                    </div>
                  </div>
                </div>

                {order.trackingInfo.trackingUrl && (
                  <a
                    href={order.trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Open Carrier Portal <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Dispatch Journey</h3>
              <div style={{ position: 'relative', paddingLeft: '32px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    background: 'rgba(15,15,16,0.1)',
                  }}
                />

                {(order.timeline || []).map((step, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '2px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: idx === order.timeline.length - 1 ? 'var(--ink-black)' : 'var(--accent-lime)',
                        color: idx === order.timeline.length - 1 ? '#ffffff' : 'var(--ink-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem', textTransform: 'capitalize' }}>
                        {step.status.replace(/_/g, ' ')}
                      </div>
                      {step.note && (
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {step.note}
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(step.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items in Drop */}
            <div style={{ borderTop: '1px solid rgba(15,15,16,0.08)', paddingTop: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Items in This Parcel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-cream)',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Color: {item.colorName} • Size: {item.size} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{item.subtotal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Info */}
            {order.shippingAddress && (
              <div
                style={{
                  marginTop: '28px',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f9f9f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <MapPin size={18} color="var(--ink-black)" />
                <span>
                  Delivering to <strong>{order.shippingAddress.fullName}</strong> in{' '}
                  <strong>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
