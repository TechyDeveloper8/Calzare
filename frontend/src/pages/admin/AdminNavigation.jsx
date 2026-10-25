import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle,
  ExternalLink,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminNavigation = () => {
  const [menus, setMenus] = useState([]);
  const [selectedKey, setSelectedKey] = useState('header');
  const [currentMenu, setCurrentMenu] = useState(null);
  const [items, setItems] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adminGetMenus();
      if (res.success) {
        setMenus(res.menus || []);
        const active = (res.menus || []).find((m) => m.menuKey === selectedKey) || res.menus?.[0];
        if (active) {
          setSelectedKey(active.menuKey);
          setCurrentMenu(active);
          setItems(active.items || []);
          setMetadata(active.metadata || {});
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load navigation menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSelectMenu = (key) => {
    setSelectedKey(key);
    const m = menus.find((menu) => menu.menuKey === key);
    if (m) {
      setCurrentMenu(m);
      setItems(m.items || []);
      setMetadata(m.metadata || {});
      setSaveSuccess(false);
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        label: 'New Link',
        url: '/shop',
        badge: '',
        isExternal: false,
      },
    ]);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleMove = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setItems(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const payload = {
        title: currentMenu?.title || selectedKey,
        items,
        metadata,
        isActive: true,
      };

      const res = await api.adminUpdateMenu(selectedKey, payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh menus list in state
        setMenus(menus.map((m) => (m.menuKey === selectedKey ? res.menu : m)));
      }
    } catch (err) {
      alert(err.message || 'Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  const menuTabs = [
    { key: 'header', label: 'Header Navigation' },
    { key: 'announcement_bar', label: 'Top Announcement Bar' },
    { key: 'footer_help', label: 'Footer: Care & Support' },
    { key: 'footer_about', label: 'Footer: Policies' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Navigation & Menus Manager</h1>
          <p className="admin-page-subtitle">
            Configure header links, announcement marquee text, drop-down routes, badges, and footer menus
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ gap: '6px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Navigation Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Menu updated successfully and published to live storefront!
        </div>
      )}

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Menu Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px', overflowX: 'auto' }}>
        {menuTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSelectMenu(tab.key)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderBottom: selectedKey === tab.key ? '2px solid var(--ink-black)' : '2px solid transparent',
              color: selectedKey === tab.key ? 'var(--ink-black)' : '#888',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Menu Editor Body */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Editing: {menuTabs.find((t) => t.key === selectedKey)?.label}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#777' }}>
              Add, remove, reorder, and assign badges (e.g., "HOT", "NEW", "₹999")
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '0.8rem', gap: '6px' }}
          >
            <Plus size={14} /> Add Menu Item
          </button>
        </div>

        {/* Announcement Bar Metadata Config */}
        {selectedKey === 'announcement_bar' && (
          <div style={{ background: '#f8f8f9', padding: '16px', borderRadius: '6px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Announcement Bar Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="admin-label">Rotation Interval (seconds)</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={metadata.rotationIntervalSec || 4}
                  onChange={(e) => setMetadata({ ...metadata, rotationIntervalSec: Number(e.target.value) })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Bar Background Color</label>
                <input
                  type="text"
                  value={metadata.bgColor || '#0f0f10'}
                  onChange={(e) => setMetadata({ ...metadata, bgColor: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Text / Accent Color</label>
                <input
                  type="text"
                  value={metadata.textColor || '#ffffff'}
                  onChange={(e) => setMetadata({ ...metadata, textColor: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Items Rows */}
        {items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            No links in this menu. Click "Add Menu Item" above to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#fcfcfc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                }}
              >
                {/* Reorder Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: idx === items.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Fields */}
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    Link Label
                  </label>
                  <input
                    type="text"
                    required
                    value={item.label}
                    onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Under ₹999"
                  />
                </div>

                <div style={{ flex: '2 1 250px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    Destination URL
                  </label>
                  <input
                    type="text"
                    required
                    value={item.url}
                    onChange={(e) => handleItemChange(idx, 'url', e.target.value)}
                    className="admin-input"
                    placeholder="e.g. /shop?category=sneakers"
                  />
                </div>

                <div style={{ flex: '0 1 120px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={item.badge || ''}
                    onChange={(e) => handleItemChange(idx, 'badge', e.target.value)}
                    className="admin-input"
                    placeholder="HOT / NEW"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={item.isExternal || false}
                      onChange={(e) => handleItemChange(idx, 'isExternal', e.target.checked)}
                    />
                    External
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="admin-btn admin-btn-outline"
                  style={{ marginTop: '16px', padding: '6px', color: '#dc2626', borderColor: '#fca5a5' }}
                  title="Remove link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ gap: '6px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Navigation Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
