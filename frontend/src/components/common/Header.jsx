import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';

export const Header = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const { user, isStaff, logout } = useAuth();
  const { totalItemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings, menus } = useStoreConfig();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const headerMenu = menus?.header;
  const rawNavItems = headerMenu?.items || [
    { label: 'Men', url: '/men' },
    { label: 'Women', url: '/women' },
    { label: 'Kids', url: '/kids', badge: 'NEW' },
    { label: 'Unisex', url: '/unisex' },
    { label: 'Clogs', url: '/shop?category=clogs' },
    { label: 'Sliders', url: '/shop?category=sliders' },
    { label: 'Sandals', url: '/shop?category=sandals' },
  ];
  const navItems = rawNavItems.filter((item) => {
    const lbl = (item.label || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    return !lbl.includes('999') && !lbl.includes('drop') && !url.includes('999');
  });

  return (
    <header className="header-wrapper header-glass">
      <div className="container">
        <div className="nav-container">
          {/* Mobile Menu Toggle */}
          <button
            className="action-icon-btn mobile-menu-btn"
            style={{ display: 'flex' }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            {settings?.storeName || 'CALZARE'}
            <span className="brand-logo-dot"></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-links" aria-label="Main Navigation">
            {navItems.map((item, idx) => (
              <Link key={idx} to={item.url} className="nav-link">
                {item.label}
                {item.badge && <span className="nav-badge-hot">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          {/* Header Action Icons */}
          <div className="header-actions">
            {/* Search Trigger */}
            <button
              className="action-icon-btn"
              onClick={onOpenSearch}
              aria-label="Search products"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Account dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="action-icon-btn"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                aria-label="User account"
                title="Account"
              >
                <UserIcon size={20} />
              </button>

              {accountMenuOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    width: '210px',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    zIndex: 150,
                  }}
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  {user ? (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <Link
                        to="/account"
                        style={{ display: 'block', padding: '8px 12px', fontSize: '0.85rem' }}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        My Account & Orders
                      </Link>
                      {isStaff && (
                        <Link
                          to="/admin"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            color: '#1b873f',
                            fontWeight: 700,
                          }}
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <Shield size={14} /> Admin CMS
                        </Link>
                      )}
                      <button
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          color: '#c53030',
                        }}
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                          navigate('/');
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        style={{ display: 'block', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600 }}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        style={{ display: 'block', padding: '8px 12px', fontSize: '0.85rem' }}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/admin/login"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                        }}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Shield size={14} /> Staff Portal
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="action-icon-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="action-count-badge">{wishlistCount}</span>}
            </Link>

            {/* Shopping Bag Drawer Trigger */}
            <button className="action-icon-btn" onClick={openCart} aria-label="Shopping bag">
              <ShoppingBag size={20} />
              {totalItemsCount > 0 && <span className="action-count-badge">{totalItemsCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            zIndex: 250,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '80%',
              maxWidth: '320px',
              height: '100%',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="brand-logo" style={{ fontSize: '1.6rem' }}>
                {settings?.storeName || 'CALZARE'}
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  className="nav-link"
                  style={{ fontSize: '1.15rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  {item.badge && <span className="nav-badge-hot">{item.badge}</span>}
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              {user ? (
                <Link
                  to="/account"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
