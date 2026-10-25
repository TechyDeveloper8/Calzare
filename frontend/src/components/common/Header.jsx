import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';

export const Header = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStaff, logout } = useAuth();
  const { totalItemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings, menus } = useStoreConfig();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Intelligent scroll detection for glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavItems = [
    { label: 'Men', url: '/men' },
    { label: 'Women', url: '/women' },
    { label: 'Kids', url: '/kids' },
    { label: 'Our Story', url: '/about' },
    { label: 'Contact', url: '/contact' },
  ];

  const headerMenu = menus?.header;
  let navItems = headerMenu?.items?.length ? headerMenu.items : defaultNavItems;

  // Filter out any unwanted categories/drop badges from legacy seeds
  navItems = navItems
    .filter((item) => {
      const lbl = (item.label || '').toLowerCase();
      const url = (item.url || '').toLowerCase();
      return (
        !lbl.includes('999') &&
        !lbl.includes('drop') &&
        !url.includes('999') &&
        !lbl.includes('unisex') &&
        !lbl.includes('clog') &&
        !lbl.includes('slider') &&
        !lbl.includes('sandal')
      );
    })
    .map((item) => {
      // Remove badge from Kids if present
      if (item.label === 'Kids' && item.badge === 'NEW') {
        return { ...item, badge: null };
      }
      return item;
    });

  // Ensure Our Story and Contact are always present in the header
  if (!navItems.some((i) => i.url === '/about')) {
    navItems.push({ label: 'Our Story', url: '/about' });
  }
  if (!navItems.some((i) => i.url === '/contact')) {
    navItems.push({ label: 'Contact', url: '/contact' });
  }

  return (
    <>
      <header
        className={`header-wrapper ${isScrolled ? 'header-glass is-scrolled' : 'header-transparent'}`}
        style={{
          transition: 'background-color 0.25s ease, backdrop-filter 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          backgroundColor: isScrolled ? 'rgba(248, 246, 240, 0.88)' : 'var(--canvas-warm)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(230, 227, 220, 0.8)' : '1px solid transparent',
          boxShadow: isScrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.05)' : 'none',
        }}
      >
        <div className="header-fluid-container">
          <div className="nav-container">
            {/* Brand Logo - Aligned to Fully Left Side */}
            <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
              {settings?.storeName || 'CALZARE'}
              <span className="brand-logo-dot" />
            </Link>

            {/* Desktop Navigation Links - Centered in Middle */}
            <nav className="desktop-nav-links" aria-label="Main Navigation">
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={idx}
                    to={item.url}
                    className="nav-link"
                    style={{
                      position: 'relative',
                      color: isActive ? 'var(--ink-black)' : 'var(--text-primary)',
                      borderBottom: isActive ? '2px solid var(--ink-black)' : '2px solid transparent',
                      paddingBottom: '4px',
                    }}
                  >
                    {item.label}
                    {item.badge && <span className="nav-badge-hot">{item.badge}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Header Action Icons - Aligned to Right on Desktop */}
            <div className="header-actions">
              {/* Search Trigger */}
              <button
                className="action-icon-btn"
                onClick={onOpenSearch}
                aria-label="Search products"
                title="Search Products"
              >
                <Search size={20} />
              </button>

              {/* Shopping Bag (Cart) with live count */}
              <button
                className="action-icon-btn"
                onClick={openCart}
                aria-label={`Shopping bag with ${totalItemsCount} items`}
                title="Cart"
                style={{ position: 'relative' }}
              >
                <ShoppingBag size={20} />
                {totalItemsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--accent-lime)',
                      color: '#0f0f10',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {/* Wishlist with live count */}
              <Link
                to="/wishlist"
                className="action-icon-btn"
                aria-label={`Wishlist with ${wishlistCount} items`}
                title="Wishlist"
                style={{ position: 'relative' }}
              >
                <Heart size={20} fill={wishlistCount > 0 ? '#ef4444' : 'none'} color={wishlistCount > 0 ? '#ef4444' : 'currentColor'} />
                {wishlistCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="header-account-wrap" style={{ position: 'relative' }}>
                <button
                  className="action-icon-btn header-account-btn"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-label="User Account"
                  title="Account"
                >
                  <UserIcon size={20} />
                </button>

                {accountMenuOpen && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: '46px',
                      right: '0',
                      width: '210px',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      zIndex: 150,
                      background: '#ffffff',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseLeave={() => setAccountMenuOpen(false)}
                  >
                    {user ? (
                      <>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                        <Link
                          to="/account"
                          style={{ display: 'block', padding: '8px 12px', fontSize: '0.84rem' }}
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
                              fontSize: '0.84rem',
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
                            fontSize: '0.84rem',
                            color: '#c53030',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
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
                          style={{ display: 'block', padding: '8px 12px', fontSize: '0.84rem', fontWeight: 700 }}
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Customer Sign In
                        </Link>
                        <Link
                          to="/register"
                          style={{ display: 'block', padding: '8px 12px', fontSize: '0.84rem' }}
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Create Account
                        </Link>
                        <Link
                          to="/track-order"
                          style={{ display: 'block', padding: '8px 12px', fontSize: '0.84rem', borderTop: '1px solid var(--border-light)' }}
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Track Live Order
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Drawer Trigger (visible on <= 991px) */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                title="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 15, 16, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 200,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '340px',
              backgroundColor: '#ffffff',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div className="brand-logo" style={{ fontSize: '1.4rem' }}>
                {settings?.storeName || 'CALZARE'}
                <span className="brand-logo-dot" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    textTransform: 'uppercase',
                    color: 'var(--ink-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && <span className="badge-lime">{item.badge}</span>}
                </Link>
              ))}

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '14px 0' }} />

              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Track Order
              </Link>
              <Link to="/size-guide" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Size Guide
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                FAQs & Support
              </Link>
            </div>

            {/* Drawer Footer Account CTA */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {user ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {user.name}
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#c53030', fontSize: '0.82rem', cursor: 'pointer' }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem', textAlign: 'center' }}
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
