import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Boxes,
  AlertTriangle,
  Search,
  Filter,
  Edit3,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Minus,
  TrendingDown,
  X,
  Package,
} from 'lucide-react';

export const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'movements'
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    threshold: 5,
  });
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'

  // Adjust stock modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustMode, setAdjustMode] = useState('set'); // 'set' | 'diff'
  const [newStockVal, setNewStockVal] = useState(0);
  const [diffVal, setDiffVal] = useState(0);
  const [adjustReason, setAdjustReason] = useState('manual_count');
  const [adjustNote, setAdjustNote] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adminGetInventory(stats.threshold || 5);
      if (res.success) {
        setInventory(res.inventory || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to load inventory matrix');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetInventoryMovements();
      if (res.success) {
        setMovements(res.movements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movement logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'matrix') {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab]);

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustMode('set');
    setNewStockVal(item.stock);
    setDiffVal(0);
    setAdjustReason('manual_count');
    setAdjustNote('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmittingAdjust(true);
      const payload = {
        variantId: selectedItem.variantId,
        size: selectedItem.size,
        reason: adjustReason,
        note: adjustNote,
      };

      if (adjustMode === 'set') {
        payload.newStock = parseInt(newStockVal, 10);
      } else {
        payload.changeQuantity = parseInt(diffVal, 10);
      }

      const res = await api.adminAdjustStock(payload);
      if (res.success) {
        setAdjustModalOpen(false);
        fetchInventory();
      }
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Filter items in matrix
  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (stockFilter === 'low') return item.isLowStock && item.stock > 0;
    if (stockFilter === 'out') return item.stock === 0;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
            Inventory Tracker & Audit Ledger
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Real-time multi-size warehouse stock counts, threshold alerts, and auditable movement history.
          </p>
        </div>

        <button
          onClick={() => (activeTab === 'matrix' ? fetchInventory() : fetchMovements())}
          className="admin-btn admin-btn-outline"
          style={{ fontSize: '0.8rem' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Stock
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.82rem',
          }}
        >
          {error}
        </div>
      )}

      {/* 4-Stat KPI Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card">
          <div className="stat-label">
            <span>Total Sellable SKUs</span>
            <Boxes size={14} color="#64748b" />
          </div>
          <div className="stat-value">{stats.totalSkus || 0}</div>
          <div className="stat-subtext">Across all colorways & UK sizes</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">
            <span>Total Warehouse Units</span>
            <Package size={14} color="#64748b" />
          </div>
          <div className="stat-value">{stats.totalStockUnits || 0}</div>
          <div className="stat-subtext">Active inventory available to sell</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">
            <span>Low Stock SKUs (&le; {stats.threshold || 5})</span>
            <AlertTriangle size={14} color={(stats.lowStockCount || 0) > 0 ? '#b45309' : '#64748b'} />
          </div>
          <div
            className="stat-value"
            style={{ color: (stats.lowStockCount || 0) > 0 ? '#b45309' : 'inherit' }}
          >
            {stats.lowStockCount || 0}
          </div>
          <div className="stat-subtext">Reorder threshold exceeded</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">
            <span>Out of Stock SKUs</span>
            <XCircle size={14} color="#b91c1c" />
          </div>
          <div
            className="stat-value"
            style={{ color: inventory.filter((i) => i.stock === 0).length > 0 ? '#b91c1c' : 'inherit' }}
          >
            {inventory.filter((i) => i.stock === 0).length}
          </div>
          <div className="stat-subtext">Zero pairs in warehouse</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Boxes size={15} /> Size Matrix Grid
        </button>
        <button
          className={`admin-tab ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          <History size={15} /> Movement Audit Ledger
        </button>
      </div>

      {activeTab === 'matrix' ? (
        <div>
          {/* Controls Bar */}
          <div className="admin-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 320px' }}>
                <input
                  type="text"
                  placeholder="Search by product name, color, size, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input"
                  style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
                />
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => setStockFilter('all')}
                  className={`admin-btn ${stockFilter === 'all' ? 'admin-btn-secondary' : 'admin-btn-outline'}`}
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                >
                  All ({inventory.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`admin-btn ${stockFilter === 'low' ? 'admin-btn-secondary' : 'admin-btn-outline'}`}
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                >
                  Low Stock (&le;{stats.threshold})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`admin-btn ${stockFilter === 'out' ? 'admin-btn-secondary' : 'admin-btn-outline'}`}
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                >
                  Out of Stock
                </button>
              </div>
            </div>
          </div>

          {/* High-Density Matrix Table */}
          <div className="admin-card">
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                Loading inventory matrix...
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                No inventory records match the current filter.
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product Model</th>
                      <th>Colorway</th>
                      <th>Footwear Size</th>
                      <th>SKU Code</th>
                      <th>Price</th>
                      <th>Units in Stock</th>
                      <th>Stock Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt=""
                                style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                              />
                            )}
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                              {item.productName}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: item.colorHex,
                                border: '1px solid #cbd5e1',
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ fontSize: '0.8rem', color: '#475569' }}>{item.colorName}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                            {item.size}
                          </span>
                        </td>
                        <td>
                          <code className="corp-code" style={{ fontSize: '0.72rem' }}>{item.sku}</code>
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          ₹{item.salePrice?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              fontVariantNumeric: 'tabular-nums',
                              color: item.stock === 0 ? '#b91c1c' : item.isLowStock ? '#b45309' : '#0f172a',
                            }}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td>
                          {item.stock === 0 ? (
                            <span className="corp-pill corp-pill-danger">
                              <span className="corp-pill-dot" /> Out of Stock
                            </span>
                          ) : item.isLowStock ? (
                            <span className="corp-pill corp-pill-warning">
                              <span className="corp-pill-dot" /> Low Stock
                            </span>
                          ) : (
                            <span className="corp-pill corp-pill-success">
                              <span className="corp-pill-dot" /> In Stock
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
                          >
                            <Edit3 size={12} /> Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Movements Audit Log Tab */
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Stock Movement Audit Trail</span>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Chronological ledger of orders, manual counts, restocks, and returns.
              </div>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
              Loading movement history...
            </div>
          ) : movements.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
              No inventory movements recorded in ledger yet.
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Product Model</th>
                    <th>Size & SKU</th>
                    <th>Adjustment Delta</th>
                    <th>Previous &rarr; New</th>
                    <th>Reason Code</th>
                    <th>Initiator</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                          {new Date(m.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                          {m.product?.name || 'Product'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.76rem', marginRight: '6px' }}>{m.size}</span>
                        <code className="corp-code" style={{ fontSize: '0.7rem' }}>{m.sku}</code>
                      </td>
                      <td>
                        <span
                          className={`corp-pill ${m.changeQuantity >= 0 ? 'corp-pill-success' : 'corp-pill-danger'}`}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                        </span>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}>
                        {m.previousStock} &rarr; <strong>{m.newStock}</strong>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: '0.76rem', color: '#334155' }}>
                          {m.reason?.replace(/_/g, ' ')}
                        </span>
                        {m.note && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{m.note}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {m.performedBy?.name || 'System Automatic'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedItem && (
        <div className="admin-modal-backdrop" onClick={() => setAdjustModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">
                Adjust Inventory: {selectedItem.productName}
              </span>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                <div>Colorway: <strong>{selectedItem.colorName}</strong> | Size: <strong>{selectedItem.size}</strong></div>
                <div style={{ marginTop: '2px' }}>SKU: <code className="corp-code" style={{ fontSize: '0.72rem' }}>{selectedItem.sku}</code></div>
                <div style={{ marginTop: '4px', fontSize: '0.84rem' }}>
                  Current In-Warehouse Stock: <strong style={{ color: '#0f172a' }}>{selectedItem.stock}</strong> units
                </div>
              </div>

              <form onSubmit={handleAdjustSubmit}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustMode('set')}
                    className={`admin-btn ${adjustMode === 'set' ? 'admin-btn-secondary' : 'admin-btn-outline'}`}
                    style={{ flex: 1, fontSize: '0.76rem', padding: '6px 10px' }}
                  >
                    Set Absolute Quantity
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustMode('diff')}
                    className={`admin-btn ${adjustMode === 'diff' ? 'admin-btn-secondary' : 'admin-btn-outline'}`}
                    style={{ flex: 1, fontSize: '0.76rem', padding: '6px 10px' }}
                  >
                    Add / Deduct Units
                  </button>
                </div>

                {adjustMode === 'set' ? (
                  <div className="admin-form-group">
                    <label className="admin-label">New Total Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newStockVal}
                      onChange={(e) => setNewStockVal(e.target.value)}
                      className="admin-input"
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Will adjust stock directly to {newStockVal} (Delta: {newStockVal - selectedItem.stock})
                    </div>
                  </div>
                ) : (
                  <div className="admin-form-group">
                    <label className="admin-label">Delta to Add or Deduct</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. +10 or -3"
                      value={diffVal}
                      onChange={(e) => setDiffVal(e.target.value)}
                      className="admin-input"
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Calculated stock level will become: {Math.max(0, selectedItem.stock + parseInt(diffVal || 0, 10))}
                    </div>
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-label">Reason for Adjustment</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="admin-select"
                  >
                    <option value="manual_count">Physical Cycle Count Audit</option>
                    <option value="received_shipment">Received Inbound Shipment</option>
                    <option value="return_restock">Customer Return Restock</option>
                    <option value="damage_writeoff">Damaged / Defective Write-off</option>
                    <option value="sample_sent">Marketing / PR Sample</option>
                    <option value="correction">Catalog Correction</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-label">Internal Audit Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified by warehouse manager"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="admin-btn admin-btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdjust}
                    className="admin-btn admin-btn-primary"
                  >
                    {submittingAdjust ? 'Updating...' : 'Save Stock Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
