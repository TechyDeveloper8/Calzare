import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Users,
  Search,
  Filter,
  Shield,
  Eye,
  Edit2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Role Edit Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newRole, setNewRole] = useState('customer');
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const query = { page: pagination.page };
      if (searchTerm) query.search = searchTerm;
      if (roleFilter) query.role = roleFilter;

      const res = await api.adminGetUsers(query);
      if (res.success) {
        setUsers(res.users || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openDetail = (u) => {
    setSelectedUser(u);
    setDetailModalOpen(true);
  };

  const openRoleModal = (u) => {
    setTargetUser(u);
    setNewRole(u.role);
    setRoleModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    try {
      setUpdatingRole(true);
      const res = await api.adminUpdateUserRole(targetUser._id, { role: newRole });
      if (res.success) {
        setUsers(users.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u)));
        setRoleModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span style={{ background: '#0f172a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Superadmin</span>;
      case 'admin':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Admin</span>;
      case 'order_manager':
      case 'product_manager':
      case 'editor':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Staff: {role}</span>;
      default:
        return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Customer</span>;
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers CRM & Staff Accounts</h1>
          <p className="admin-page-subtitle">
            Manage customer accounts, verified shipping addresses, purchase histories, and RBAC permissions
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 320px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search customers by name or email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={16} color="#666" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-select"
              style={{ minWidth: '160px' }}
            >
              <option value="">All Roles</option>
              <option value="customer">Customers Only</option>
              <option value="admin">Admins</option>
              <option value="superadmin">Superadmins</option>
              <option value="order_manager">Order Managers</option>
              <option value="product_manager">Product Managers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading customer records...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No customers found</h3>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Try clearing filters or search keyword</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Addresses</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>{u.email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#777' }}>{u.phone || '—'}</span>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {u.addresses?.length || 0} {u.addresses?.length === 1 ? 'saved' : 'saved'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#666' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openDetail(u)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          title="View customer profile"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => openRoleModal(u)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          title="Change RBAC role"
                        >
                          <Shield size={13} /> Role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {detailModalOpen && selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>
                  {selectedUser.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {getRoleBadge(selectedUser.role)}
                  <span style={{ fontSize: '0.8rem', color: '#777' }}>
                    Member since {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Contact info */}
            <div style={{ background: '#f8f8f9', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '8px' }}>
                <Mail size={16} color="#666" /> <span>{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Phone size={16} color="#666" /> <span>{selectedUser.phone}</span>
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> Saved Shipping Addresses ({selectedUser.addresses?.length || 0})
              </h4>
              {!selectedUser.addresses || selectedUser.addresses.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                  No saved addresses on file yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedUser.addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        background: addr.isDefault ? '#fff' : '#fafafa',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700 }}>{addr.fullName} ({addr.label || 'Home'})</span>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.65rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div>{addr.street}</div>
                      {addr.landmark && <div style={{ color: '#666' }}>Near {addr.landmark}</div>}
                      <div>{addr.city}, {addr.state} - {addr.postalCode}</div>
                      <div style={{ color: '#777', marginTop: '4px' }}>Phone: {addr.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailModalOpen(false)} className="admin-btn admin-btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModalOpen && targetUser && (
        <div className="admin-modal-overlay" onClick={() => setRoleModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>
              Change Role: {targetUser.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
              Select administrative or store staff privilege level for {targetUser.email}
            </p>

            <form onSubmit={handleUpdateRole}>
              <div style={{ marginBottom: '20px' }}>
                <label className="admin-label">Access Level</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="admin-select"
                >
                  <option value="customer">Customer (Storefront Only)</option>
                  <option value="order_manager">Order Manager (Fulfillment & Tracking)</option>
                  <option value="product_manager">Product Manager (Catalog & Variants)</option>
                  <option value="editor">Editor (CMS, Banners & Reviews)</option>
                  <option value="admin">Admin (Full Store Management)</option>
                  <option value="superadmin">Superadmin (All Permissions + Role Changes)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRoleModalOpen(false)} className="admin-btn admin-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={updatingRole} className="admin-btn admin-btn-primary">
                  {updatingRole ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
