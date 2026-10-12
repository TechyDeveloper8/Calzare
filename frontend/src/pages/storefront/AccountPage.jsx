import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { api } from '../../api/api.js';
import { User, Package, MapPin, Heart, LogOut, Loader2, ArrowRight } from 'lucide-react';

export const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: 'Karnataka',
    postalCode: '',
  });
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.getMyOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddress);
      if (res.success && res.addresses) {
        setUser({ ...user, addresses: res.addresses });
        setAddressFormOpen(false);
        setNewAddress({ label: 'Home', fullName: user.name, phone: user.phone || '', street: '', landmark: '', city: '', state: 'Karnataka', postalCode: '' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await api.deleteAddress(addressId);
      if (res.success && res.addresses) {
        setUser({ ...user, addresses: res.addresses });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="section-eyebrow">CUSTOMER PORTAL</span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', margin: 0 }}>WELCOME, {user.name}</h1>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> SIGN OUT
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '40px', overflowX: 'auto' }}>
          <button
            className={activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} /> MY ORDERS ({orders.length})
          </button>
          <button
            className={activeTab === 'addresses' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={16} /> SAVED ADDRESSES ({user.addresses?.length || 0})
          </button>
          <button
            className={activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> PROFILE INFO
          </button>
          <Link
            to="/account/wishlist"
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Heart size={16} /> WISHLIST ({wishlist.length})
          </Link>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Loader2 size={32} className="animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-lg)',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{ord.orderNumber}</span>
                        <span style={{ marginLeft: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className={ord.paymentStatus === 'completed' ? 'badge-lime' : 'badge-black'}>
                          {ord.paymentStatus?.toUpperCase()}
                        </span>
                        <span className="badge-glass" style={{ textTransform: 'uppercase' }}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {ord.items?.map((it, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={it.image} alt={it.productName} style={{ width: '48px', height: '52px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{it.productName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Color: {it.colorName} • Size: {it.size} • Qty: {it.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>₹{it.subtotal?.toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total: ₹{ord.totalAmount?.toLocaleString('en-IN')}</div>
                      <Link to={`/order-success/${ord.orderNumber}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        VIEW RECEIPT <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '64px 20px', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ marginBottom: '8px' }}>NO ORDERS YET</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  You haven't placed any footwear orders yet.
                </p>
                <Link to="/shop" className="btn-primary">
                  START SHOPPING
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>SAVED ADDRESSES</h3>
              <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.82rem' }} onClick={() => setAddressFormOpen(!addressFormOpen)}>
                + ADD NEW ADDRESS
              </button>
            </div>

            {addressFormOpen && (
              <form onSubmit={handleAddAddress} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: '#ffffff', marginBottom: '32px' }}>
                <h4 style={{ marginBottom: '16px' }}>Add Delivery Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="admin-input"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Flat / House No."
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="admin-input"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
                  SAVE ADDRESS
                </button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {user.addresses?.map((addr) => (
                <div key={addr._id} style={{ background: '#ffffff', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge-black">{addr.label}</span>
                    <button onClick={() => handleDeleteAddress(addr._id)} style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700 }}>
                      DELETE
                    </button>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '8px' }}>{addr.fullName}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '6px 0' }}>
                    {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Phone: {addr.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#ffffff', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Profile Details</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user.name}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user.email}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
