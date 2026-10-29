import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/api.js';
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  Layers,
  Truck,
  Boxes,
  Tag,
  Star,
  FileText,
  Menu as MenuIcon,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  ChevronRight,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes security inactivity auto-lock

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStaff, loading, logout, login } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  // Inactivity tracking timer
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Monitor user interactions across the dashboard
  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });

    // Periodic check every 15 seconds
    timerRef.current = setInterval(() => {
      if (!isLocked && Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        setIsLocked(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLocked, resetInactivityTimer]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Handle workstation unlock
  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!unlockPassword) {
      setUnlockError('Please enter your password to unlock the workstation.');
      return;
    }

    try {
      setUnlocking(true);
      setUnlockError('');
      await login(user.email, unlockPassword);
      setIsLocked(false);
      setUnlockPassword('');
      lastActivityRef.current = Date.now();
    } catch (err) {
      setUnlockError(err.message || 'Incorrect password. Workstation remains locked.');
    } finally {
      setUnlocking(false);
    }
  };

  // 1. Loading State: Display high-security initialization screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          fontFamily: 'var(--corp-font)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#1e293b',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#3b82f6',
          }}
        >
          <ShieldCheck size={36} />
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>
          CALZARE Enterprise Control Center
        </div>
        <div style={{ fontSize: '0.84rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 size={16} className="animate-spin" /> Verifying Cryptographic Session & RBAC Permissions...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Unauthorized: Safe redirect with saved return location
  if (!user || !isStaff) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Navigation Definitions (Least Privilege Principle)
  const navGroups = [
    {
      title: 'Core',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin',
          roles: ['superadmin', 'admin', 'product_manager', 'order_manager', 'editor'],
        },
      ],
    },
    {
      title: 'Commerce',
      items: [
        {
          label: 'Orders & Fulfillment',
          icon: Truck,
          path: '/admin/orders',
          roles: ['superadmin', 'admin', 'order_manager'],
        },
        {
          label: 'Products & SKUs',
          icon: ShoppingBag,
          path: '/admin/products',
          roles: ['superadmin', 'admin', 'product_manager'],
        },
        {
          label: 'Inventory Tracker',
          icon: Boxes,
          path: '/admin/inventory',
          roles: ['superadmin', 'admin', 'product_manager', 'order_manager'],
        },
        {
          label: 'Collections & Cats',
          icon: Layers,
          path: '/admin/collections',
          roles: ['superadmin', 'admin', 'product_manager'],
        },
      ],
    },
    {
      title: 'Content & CMS',
      items: [
        {
          label: 'Homepage CMS',
          icon: Sparkles,
          path: '/admin/homepage',
          roles: ['superadmin', 'admin', 'editor'],
        },
        {
          label: 'Our Story Manager',
          icon: BookOpen,
          path: '/admin/our-story',
          roles: ['superadmin', 'admin', 'editor'],
        },
        {
          label: 'Pages & Policies',
          icon: FileText,
          path: '/admin/pages',
          roles: ['superadmin', 'admin', 'editor'],
        },
        {
          label: 'Customer Reviews',
          icon: Star,
          path: '/admin/reviews',
          roles: ['superadmin', 'admin', 'editor'],
        },
      ],
    },
    {
      title: 'Marketing & CRM',
      items: [
        {
          label: 'Coupons & Promos',
          icon: Tag,
          path: '/admin/coupons',
          roles: ['superadmin', 'admin'],
        },
        {
          label: 'Customer Directory',
          icon: Users,
          path: '/admin/customers',
          roles: ['superadmin', 'admin', 'order_manager'],
        },
      ],
    },
    {
      title: 'System & Security',
      items: [
        {
          label: 'Navigation Menus',
          icon: MenuIcon,
          path: '/admin/navigation',
          roles: ['superadmin', 'admin'],
        },
        {
          label: 'Settings & Security',
          icon: Settings,
          path: '/admin/settings',
          roles: ['superadmin', 'admin'],
        },
      ],
    },
  ];

  // Filter groups and items by user role
  const userRole = user.role || 'customer';
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  // Derive readable breadcrumb from current path
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/admin') return 'Dashboard';
    if (p.includes('/admin/orders')) return 'Orders & Fulfillment';
    if (p.includes('/admin/products')) return 'Products & SKUs';
    if (p.includes('/admin/inventory')) return 'Inventory Tracker';
    if (p.includes('/admin/collections')) return 'Collections & Categories';
    if (p.includes('/admin/homepage')) return 'Homepage CMS';
    if (p.includes('/admin/our-story')) return 'Our Story Manager';
    if (p.includes('/admin/pages')) return 'Pages & Policies';
    if (p.includes('/admin/reviews')) return 'Customer Reviews';
    if (p.includes('/admin/coupons')) return 'Coupons & Promotions';
    if (p.includes('/admin/customers')) return 'Customer Directory';
    if (p.includes('/admin/navigation')) return 'Navigation Menus';
    if (p.includes('/admin/settings')) return 'Settings & Security Audit';
    return 'Control Center';
  };

  const userInitials = (user?.name || 'Staff')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="admin-layout">
      {/* ── SECURITY INACTIVITY LOCK SCREEN OVERLAY ───────────────────────── */}
      {isLocked && (
        <div className="admin-lockscreen-overlay" role="dialog" aria-modal="true">
          <div className="admin-lockscreen-card">
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Lock size={26} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Workstation Locked
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 20px', lineHeight: 1.45 }}>
              Administrative session automatically secured after 15 minutes of inactivity. All unsaved work preserved.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {user.role} • {user.email}
                </div>
              </div>
            </div>

            {unlockError && (
              <div
                style={{
                  padding: '10px 12px',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{unlockError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock}>
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label className="admin-label" style={{ marginBottom: '6px' }}>
                  Verify Password to Resume
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="admin-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={unlocking}
                className="admin-btn admin-btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginBottom: '10px' }}
              >
                {unlocking ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Unlock size={15} /> Unlock Workstation
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/admin/login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                Switch Account / Sign Out
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deep Corporate Navy Sidebar */}
      <aside className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              C
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                CALZARE
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                CONTROL CENTER
              </div>
            </div>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title="Open Live Storefront in new tab"
            style={{
              color: '#64748b',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Categorized Nav Groups filtered by RBAC */}
        <nav className="admin-sidebar-nav">
          {filteredNavGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '8px' }}>
              <div className="admin-nav-group-title">{group.title}</div>
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Corporate User Profile Footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  color: '#93c5fd',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              style={{
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                padding: '6px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Secure Sign Out"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.background = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Executive Top Bar */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
            <button
              type="button"
              className="admin-mobile-toggle-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
              aria-label="Toggle navigation"
            >
              <MenuIcon size={18} />
            </button>
            <span style={{ color: '#64748b' }}>Control Center</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{getBreadcrumb()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Security Status Badge */}
            <span className="admin-security-pill" title="Cryptographically verified staff session with RBAC access gate">
              <ShieldCheck size={13} color="#16a34a" /> RBAC: {user.role.toUpperCase()}
            </span>

            {/* Quick Lock Button */}
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="admin-lock-btn"
              title="Manually lock administrative screen immediately (OWASP Workstation Standard)"
            >
              <Lock size={13} /> Lock Workstation
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <ExternalLink size={13} /> View Storefront
            </a>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="admin-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
