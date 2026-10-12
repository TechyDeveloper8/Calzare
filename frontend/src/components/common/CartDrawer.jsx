import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    cartAlert,
    setCartAlert,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setCouponApplying(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const items = cart.items || [];
  const freeShippingThreshold = cart.freeShippingThreshold || 999;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>SHOPPING BAG</h3>
            <span className="badge-black" style={{ padding: '2px 8px' }}>
              {items.length}
            </span>
          </div>
          <button onClick={closeCart} aria-label="Close cart" style={{ padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ padding: '16px 24px', background: '#faf8f5', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
            {cart.subtotal >= freeShippingThreshold ? (
              <span style={{ color: '#1b873f' }}>🎉 Congratulations! You have unlocked FREE Express Shipping!</span>
            ) : (
              <span>Add ₹{(freeShippingThreshold - cart.subtotal).toLocaleString('en-IN')} more for FREE Express Shipping</span>
            )}
          </div>
          <div className="free-shipping-progress">
            <div className="free-shipping-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Stock Alert Banner if any */}
        {cartAlert && (
          <div
            style={{
              padding: '12px 24px',
              background: '#fff1f2',
              color: '#be123c',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{cartAlert}</span>
            </div>
            <button onClick={() => setCartAlert(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Cart Item List */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👟</div>
              <h4 style={{ marginBottom: '8px' }}>YOUR BAG IS EMPTY</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
                Explore our cloud foam drops and step into pure buoyancy.
              </p>
              <Link to="/shop" className="btn-primary" onClick={closeCart}>
                SHOP BESTSELLERS
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="cart-item-row">
                <img src={item.image} alt={item.productName} className="cart-item-thumb" />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link
                      to={`/product/${item.productSlug}`}
                      onClick={closeCart}
                      style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink-black)' }}
                    >
                      {item.productName}
                    </Link>
                    <button
                      onClick={() => removeItem(item._id)}
                      style={{ color: 'var(--text-muted)', padding: '2px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                    {item.colorName} • Size: {item.size}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                    }}
                  >
                    {/* Quantity Selector */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '2px 8px',
                        gap: '10px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{ padding: '2px' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{ padding: '2px' }}
                        disabled={item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                      ₹{item.subtotal?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Coupon and Checkout */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Coupon Code Section */}
            {cart.coupon ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                  <Tag size={15} />
                  <span>Coupon {cart.coupon.code} applied!</span>
                </div>
                <button onClick={removeCoupon} style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 700 }}>
                  REMOVE
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{
                    flexGrow: 1,
                    padding: '8px 14px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                  disabled={couponApplying}
                >
                  {couponApplying ? '...' : 'APPLY'}
                </button>
              </form>
            )}
            {couponError && (
              <div style={{ color: '#dc2626', fontSize: '0.75rem', marginBottom: '12px' }}>{couponError}</div>
            )}

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bag Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{cart.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {cart.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 700 }}>-₹{cart.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Shipping</span>
                <span style={{ fontWeight: 600 }}>
                  {cart.shippingFee === 0 ? <strong style={{ color: '#166534' }}>FREE</strong> : `₹${cart.shippingFee}`}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-light)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                <span>TOTAL</span>
                <span>₹{cart.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '16px' }}
              onClick={handleProceedToCheckout}
            >
              PROCEED TO CHECKOUT <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
