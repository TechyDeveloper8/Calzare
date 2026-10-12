import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <CheckCircle2 size={40} />
          </div>
          <span className="section-eyebrow">ORDER CONFIRMATION</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '12px' }}>
            THANK YOU FOR YOUR STRIDE.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Your order <strong>{order.orderNumber}</strong> has been logged into our fulfillment queue.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="glass-panel" style={{ padding: '36px', borderRadius: 'var(--radius-xl)', background: '#ffffff', marginBottom: '32px' }}>
          {/* Order Details Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Number</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>{order.orderNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Status</div>
              <span className={order.paymentStatus === 'completed' ? 'badge-lime' : 'badge-black'}>
                {order.paymentStatus?.toUpperCase()} ({order.paymentMethod?.toUpperCase()})
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fulfillment</div>
              <span className="badge-glass" style={{ textTransform: 'uppercase' }}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>ITEMS PURCHASED</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.productName} style={{ width: '64px', height: '68px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Color: {item.colorName} • Size: {item.size} • Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>₹{item.subtotal?.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Financial Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-muted)' }}>DELIVERING TO</h4>
              <div style={{ fontWeight: 700 }}>{order.shippingAddress?.fullName}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {order.shippingAddress?.street}, {order.shippingAddress?.landmark && `${order.shippingAddress.landmark}, `}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Phone: {order.customerPhone}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-muted)' }}>PAYMENT SUMMARY</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#166534', marginBottom: '6px' }}>
                  <span>Discount</span>
                  <span>-₹{order.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                <span>Express Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <span>Total Paid</span>
                <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div style={{ paddingTop: '24px' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>FULFILLMENT TIMELINE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                {order.timeline.map((evt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink-black)' }} />
                    <strong style={{ textTransform: 'capitalize' }}>{evt.status}:</strong>
                    <span>{evt.note}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      ({new Date(evt.timestamp).toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/shop" className="btn-primary">
            CONTINUE SHOPPING <ArrowRight size={16} />
          </Link>
          <Link to="/account" className="btn-secondary">
            VIEW ACCOUNT ORDERS
          </Link>
        </div>
      </div>
    </div>
  );
};
