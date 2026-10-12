import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ error: '', success: '' });

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg({ error: '', success: '' });
    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      setCouponMsg({ error: '', success: res.message });
      setCouponCode('');
    } else {
      setCouponMsg({ error: res.message, success: '' });
    }
  };

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>👟</div>
        <h2 style={{ marginBottom: '12px' }}>YOUR SHOPPING BAG IS EMPTY</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Discover our dual-density waterproof cloud foam silhouettes.
        </p>
        <Link to="/shop" className="btn-primary">
          EXPLORE CATALOGUE
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container">
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginBottom: '40px' }}>YOUR SHOPPING BAG</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="pdp-layout-grid">
          {/* Items List Column */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {items.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    gap: '24px',
                    padding: '24px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    style={{ width: '100px', height: '110px', borderRadius: '12px', objectFit: 'cover', background: '#f5f3ee' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Link to={`/product/${item.productSlug}`} style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {item.productName}
                      </Link>
                      <button onClick={() => removeItem(item._id)} style={{ color: '#dc2626' }} title="Remove">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '6px 0 16px' }}>
                      Color: <strong>{item.colorName}</strong> • Size: <strong>{item.size}</strong> • SKU: {item.sku}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-pill)',
                          padding: '4px 12px',
                          gap: '12px',
                        }}
                      >
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                        ₹{item.subtotal?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Column */}
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h3 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>ORDER SUMMARY</h3>

              {/* Coupon Form */}
              {cart.coupon ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                    <Tag size={16} />
                    <span>Coupon {cart.coupon.code} Applied</span>
                  </div>
                  <button onClick={removeCoupon} style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.8rem' }}>
                    REMOVE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      flexGrow: 1,
                      padding: '10px 14px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.82rem' }}>
                    APPLY
                  </button>
                </form>
              )}
              {couponMsg.error && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '14px' }}>{couponMsg.error}</div>}
              {couponMsg.success && <div style={{ color: '#166534', fontSize: '0.8rem', marginBottom: '14px' }}>{couponMsg.success}</div>}

              {/* Calculations Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>₹{cart.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {cart.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                    <span>Discount Savings</span>
                    <span>-₹{cart.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Express Shipping</span>
                  <span>{cart.shippingFee === 0 ? <strong style={{ color: '#166534' }}>FREE</strong> : `₹${cart.shippingFee}`}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-light)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                  }}
                >
                  <span>TOTAL DUE</span>
                  <span>₹{cart.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                className="btn-primary btn-lime"
                style={{ width: '100%', padding: '18px' }}
                onClick={() => navigate('/checkout')}
              >
                PROCEED TO CHECKOUT <ArrowRight size={18} />
              </button>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#166534" /> 100% Encrypted & Secure Checkout
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={16} color="#166534" /> 7-Day Hassle-Free Doorstep Size Exchange
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
