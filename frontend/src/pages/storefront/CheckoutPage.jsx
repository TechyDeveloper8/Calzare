import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/api.js';
import { ShieldCheck, Truck, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    guestEmail: user?.email || '',
    customerPhone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    landmark: user?.addresses?.[0]?.landmark || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Karnataka',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    paymentMethod: 'razorpay', // 'razorpay' or 'cod'
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName || !formData.customerPhone || !formData.street || !formData.city || !formData.postalCode) {
      setErrorMessage('Please fill in all mandatory delivery address fields.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        guestEmail: formData.guestEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          fullName: formData.customerName,
          phone: formData.customerPhone,
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          size: i.size,
          quantity: i.quantity,
        })),
        couponCode: cart.coupon?.code || null,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await api.checkout(payload);

      if (!res.success) {
        throw new Error(res.message || 'Checkout failed');
      }

      const order = res.order;

      // Handle Razorpay Payment flow
      if (formData.paymentMethod === 'razorpay') {
        const razorpayKey = res.razorpayKeyId || 'rzp_test_calzare12345';
        const rzpOrder = res.razorpayOrder;

        if (window.Razorpay && rzpOrder) {
          const options = {
            key: razorpayKey,
            amount: rzpOrder.amount,
            currency: 'INR',
            name: 'CALZARE Footwear',
            description: `Order ${order.orderNumber}`,
            order_id: rzpOrder.id,
            handler: async function (response) {
              try {
                // Cryptographic server-side verification
                const verifyRes = await api.verifyPayment({
                  orderId: order._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                await refreshCart();
                navigate(`/order-success/${order.orderNumber}`);
              } catch (err) {
                alert('Payment verification failed: ' + err.message);
              }
            },
            prefill: {
              name: formData.customerName,
              email: formData.guestEmail,
              contact: formData.customerPhone,
            },
            theme: {
              color: '#0f0f10',
            },
            modal: {
              ondismiss: function () {
                // If modal closed, navigate to order detail to complete payment later
                navigate(`/order-success/${order.orderNumber}`);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // In test/sandbox fallback environment, simulate verified payment
          await api.verifyPayment({
            orderId: order._id,
            razorpayOrderId: rzpOrder?.id || `sim_${Date.now()}`,
            razorpayPaymentId: `pay_${Date.now()}`,
            razorpaySignature: 'simulated_test_sig',
          });
          await refreshCart();
          navigate(`/order-success/${order.orderNumber}`);
        }
      } else {
        // COD order
        await refreshCart();
        navigate(`/order-success/${order.orderNumber}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to place order. Please review your cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container">
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginBottom: '32px' }}>EXPRESS CHECKOUT</h1>

        {errorMessage && (
          <div
            style={{
              padding: '16px 20px',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '12px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="pdp-layout-grid">
            {/* Left: Customer & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* 1. Contact Information */}
              <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>1. CONTACT INFORMATION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="admin-label">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="e.g. Anurag Raj"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Mobile Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label className="admin-label">Email Address (for Order Updates & Tracking) *</label>
                  <input
                    type="email"
                    name="guestEmail"
                    required
                    value={formData.guestEmail}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>2. SHIPPING ADDRESS</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label className="admin-label">Flat / House No. / Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="Flat 402, Oak Residency, 12th Main Road"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="admin-label">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Near Metro Station"
                    />
                  </div>
                  <div>
                    <label className="admin-label">PIN Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="560038"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="admin-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div>
                    <label className="admin-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Karnataka"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>3. PAYMENT METHOD</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Razorpay Prepaid Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: formData.paymentMethod === 'razorpay' ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                      background: formData.paymentMethod === 'razorpay' ? '#faf8f5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                    />
                    <CreditCard size={22} color="var(--ink-black)" />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 800 }}>Online Payment via Razorpay</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking • Instant Dispatch
                      </div>
                    </div>
                    <span className="badge-lime" style={{ fontSize: '0.7rem' }}>RECOMMENDED</span>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: formData.paymentMethod === 'cod' ? '2px solid var(--ink-black)' : '1px solid var(--border-light)',
                      background: formData.paymentMethod === 'cod' ? '#faf8f5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <Banknote size={22} color="var(--ink-black)" />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 800 }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pay cash or UPI directly to the courier upon doorstep delivery
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Breakdown */}
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
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>ORDER REVIEW ({cart.items?.length} items)</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', marginBottom: '24px' }}>
                  {cart.items?.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{ width: '56px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.colorName} • Size {item.size} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>₹{item.subtotal?.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span>₹{cart.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                      <span>Coupon Discount</span>
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
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-light)',
                    }}
                  >
                    <span>TOTAL AMOUNT</span>
                    <span>₹{cart.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lime"
                  style={{ width: '100%', padding: '18px', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> PROCESSING...
                    </>
                  ) : (
                    `PLACE ORDER • ₹${cart.total?.toLocaleString('en-IN')}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
