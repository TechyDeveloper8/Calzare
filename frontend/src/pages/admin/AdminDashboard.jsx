import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  TrendingUp,
  Package,
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Loader2,
  Download,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAnalytics(range);
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const m = analytics?.metrics || {};

  // Status badge helper
  const getStatusPill = (status) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
        return (
          <span className="corp-pill corp-pill-success">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      case 'shipped':
      case 'processing':
        return (
          <span className="corp-pill corp-pill-info">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      case 'pending':
        return (
          <span className="corp-pill corp-pill-warning">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      case 'cancelled':
        return (
          <span className="corp-pill corp-pill-danger">
            <span className="corp-pill-dot" /> {status}
          </span>
        );
      default:
        return (
          <span className="corp-pill corp-pill-neutral">
            <span className="corp-pill-dot" /> {status || 'N/A'}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Executive Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Executive Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Live commerce analytics and inventory status derived directly from transactional records.
          </p>
        </div>

        {/* Range Segmented Controls & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            {[
              { label: 'Today', val: 'today' },
              { label: '7 Days', val: '7d' },
              { label: '30 Days', val: '30d' },
              { label: '90 Days', val: '90d' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setRange(item.val)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: range === item.val ? '#0f172a' : 'transparent',
                  color: range === item.val ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="admin-btn admin-btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            title="Refresh Metrics"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color="#2563eb" />
        </div>
      ) : (
        <>
          {/* 4-Column Executive KPI Cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-label">
                <span>Net Revenue</span>
                <span className="corp-pill corp-pill-success" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                  <TrendingUp size={11} /> Real
                </span>
              </div>
              <div className="stat-value">₹{(m.netSales || 0).toLocaleString('en-IN')}</div>
              <div className="stat-subtext">
                <span>Gross: ₹{(m.grossSales || 0).toLocaleString('en-IN')}</span>
                <span>• Excludes cancelled</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">
                <span>Total Orders</span>
                <Package size={14} color="#64748b" />
              </div>
              <div className="stat-value">{m.totalOrdersCount || 0}</div>
              <div className="stat-subtext">
                <span style={{ color: '#047857', fontWeight: 600 }}>{m.confirmedCount || 0} Confirmed</span>
                <span>•</span>
                <span style={{ color: '#b45309', fontWeight: 600 }}>{m.pendingCount || 0} Pending</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">
                <span>Average Order Value</span>
                <IndianRupee size={14} color="#64748b" />
              </div>
              <div className="stat-value">₹{(m.averageOrderValue || 0).toLocaleString('en-IN')}</div>
              <div className="stat-subtext">
                <span>Discounts applied: ₹{(m.totalDiscountGiven || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">
                <span>Low Stock Alert</span>
                <AlertTriangle size={14} color={(m.lowStockVariantsCount || 0) > 0 ? '#b45309' : '#64748b'} />
              </div>
              <div
                className="stat-value"
                style={{ color: (m.lowStockVariantsCount || 0) > 0 ? '#b45309' : 'inherit' }}
              >
                {m.lowStockVariantsCount || 0}
              </div>
              <div className="stat-subtext">
                <Link
                  to="/admin/inventory"
                  style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  Manage inventory matrix <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Fulfillment Pipeline Summary Bar */}
          <div className="admin-card" style={{ marginBottom: '20px' }}>
            <div className="admin-card-header">
              <span className="admin-card-title">Fulfillment Pipeline Distribution</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Based on active database orders
              </span>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem' }}>
                <span>Confirmed & Processing: <strong>{m.confirmedCount || 0}</strong></span>
                <span>Pending Review: <strong>{m.pendingCount || 0}</strong></span>
                <span>Total Lifecycle Orders: <strong>{m.totalOrdersCount || 0}</strong></span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: '#f1f5f9',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, ((m.confirmedCount || 0) / Math.max(1, m.totalOrdersCount || 1)) * 100)}%`,
                    background: '#10b981',
                  }}
                  title="Confirmed Orders"
                />
                <div
                  style={{
                    width: `${Math.min(100, ((m.pendingCount || 0) / Math.max(1, m.totalOrdersCount || 1)) * 100)}%`,
                    background: '#f59e0b',
                  }}
                  title="Pending Orders"
                />
              </div>
            </div>
          </div>

          {/* Two-Column Data Grid: Top Products & Recent Orders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {/* Top 5 Bestsellers */}
            <div className="admin-card" style={{ marginBottom: 0 }}>
              <div className="admin-card-header">
                <span className="admin-card-title">Top Performing Footwear</span>
                <Link
                  to="/admin/products"
                  className="admin-btn admin-btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  View Catalog <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ padding: '8px 16px' }}>
                {analytics?.topProducts?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {analytics.topProducts.map((p, idx) => {
                      const img = p.defaultImages?.[0]?.url;
                      return (
                        <div
                          key={p._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 0',
                            borderBottom: idx < analytics.topProducts.length - 1 ? '1px solid #f1f5f9' : 'none',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#94a3b8',
                              width: '18px',
                              textAlign: 'center',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={img}
                            alt=""
                            style={{
                              width: '40px',
                              height: '42px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: '0.84rem',
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ₹{p.baseSalePrice?.toLocaleString('en-IN')} • {p.productType || 'Footwear'}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              background: '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {p.salesCount || 0} sold
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No recorded product sales for this timeframe.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Activity */}
            <div className="admin-card" style={{ marginBottom: 0 }}>
              <div className="admin-card-header">
                <span className="admin-card-title">Recent Order Activity</span>
                <Link
                  to="/admin/orders"
                  className="admin-btn admin-btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  Fulfillment Center <ArrowRight size={12} />
                </Link>
              </div>
              <div className="admin-table-container">
                {analytics?.recentOrders?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td>
                            <Link
                              to="/admin/orders"
                              className="corp-code"
                              style={{ textDecoration: 'none', color: '#2563eb' }}
                            >
                              {ord.orderNumber}
                            </Link>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                              {ord.customerName || 'Customer'}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            ₹{ord.totalAmount?.toLocaleString('en-IN')}
                          </td>
                          <td>{getStatusPill(ord.orderStatus)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No customer transactions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
