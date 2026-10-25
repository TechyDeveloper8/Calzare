import React from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
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
  Bell,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStaff, logout } = useAuth();

  if (!user || !isStaff) {
    navigate('/admin/login');
    return null;
  }

  const navGroups = [
    {
      title: 'Core',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { label: 'Orders & Fulfillment', icon: Truck, path: '/admin/orders' },
        { label: 'Products & SKUs', icon: ShoppingBag, path: '/admin/products' },
        { label: 'Inventory Tracker', icon: Boxes, path: '/admin/inventory' },
        { label: 'Collections & Cats', icon: Layers, path: '/admin/collections' },
      ],
    },
    {
      title: 'Content & CMS',
      items: [
        { label: 'Homepage CMS', icon: Sparkles, path: '/admin/homepage' },
        { label: 'Our Story Manager', icon: BookOpen, path: '/admin/our-story' },
        { label: 'Pages & Policies', icon: FileText, path: '/admin/pages' },
        { label: 'Customer Reviews', icon: Star, path: '/admin/reviews' },
      ],
    },
    {
      title: 'Marketing & CRM',
      items: [
        { label: 'Coupons & Promos', icon: Tag, path: '/admin/coupons' },
        { label: 'Customer Directory', icon: Users, path: '/admin/customers' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Navigation Menus', icon: MenuIcon, path: '/admin/navigation' },
        { label: 'Settings & Audit', icon: Settings, path: '/admin/settings' },
      ],
    },
  ];

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
    if (p.includes('/admin/settings')) return 'Settings & Audit Trail';
    return 'Control Center';
  };

  const userInitials = (user?.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="admin-layout">
      {/* Deep Corporate Navy Sidebar */}
      <aside className="admin-sidebar">
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

        {/* Categorized Nav Groups */}
        <nav className="admin-sidebar-nav">
          {navGroups.map((group, gIdx) => (
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
              title="Sign Out"
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
            <span style={{ color: '#64748b' }}>Control Center</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{getBreadcrumb()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="corp-pill corp-pill-success" style={{ fontSize: '0.7rem' }}>
              <span className="corp-pill-dot" /> Live System
            </span>

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
