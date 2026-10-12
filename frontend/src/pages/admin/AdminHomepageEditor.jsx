import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';

export const AdminHomepageEditor = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetSections();
      if (res.success && res.sections) {
        setSections(res.sections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await api.adminToggleSection(id);
      if (res.success) {
        setSections((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isEnabled: res.section.isEnabled } : s))
        );
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);

    // Save reordered array to backend
    const orderedIds = newSections.map((s) => s._id);
    await api.adminReorderSections(orderedIds);
  };

  const handleOpenEdit = (sec) => {
    setEditingSection(JSON.parse(JSON.stringify(sec)));
    setSaveSuccess(false);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.adminUpdateSection(editingSection._id, editingSection);
      if (res.success) {
        setSections((prev) => prev.map((s) => (s._id === editingSection._id ? res.section : s)));
        setSaveSuccess(true);
        setTimeout(() => setEditingSection(null), 1000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="#2563eb" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
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
            Homepage CMS Builder
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Reorder, toggle, and configure campaign modules and merchandised sections on the live storefront.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-outline"
          style={{ fontSize: '0.8rem' }}
        >
          <ExternalLink size={13} /> View Live Storefront
        </a>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((sec, idx) => (
          <div
            key={sec._id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: sec.isEnabled ? 1 : 0.65,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Order Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  style={{
                    opacity: idx === 0 ? 0.3 : 1,
                    padding: '2px',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                  }}
                  title="Move Section Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  style={{
                    opacity: idx === sections.length - 1 ? 0.3 : 1,
                    padding: '2px',
                    cursor: idx === sections.length - 1 ? 'default' : 'pointer',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                  }}
                  title="Move Section Down"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="corp-code" style={{ fontSize: '0.72rem' }}>
                    {sec.sectionType?.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                    {sec.title ? sec.title.replace('\n', ' ') : sec.sectionKey}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Key: <code>{sec.sectionKey}</code> • Layout: {sec.config?.layoutVariant || 'standard'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="admin-btn admin-btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => handleToggle(sec._id)}
              >
                {sec.isEnabled ? (
                  <>
                    <Eye size={13} color="#047857" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff size={13} color="#94a3b8" /> Hidden
                  </>
                )}
              </button>

              <button
                className="admin-btn admin-btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => handleOpenEdit(sec)}
              >
                <Edit size={13} /> Edit Section
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="admin-modal-backdrop" onClick={() => setEditingSection(null)}>
          <div
            className="admin-modal-container"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <span className="admin-modal-title">
                Configure Section: {editingSection.sectionKey}
              </span>
              <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveSection}>
                <div className="admin-form-group">
                  <label className="admin-label">Eyebrow Tag / Supertitle</label>
                  <input
                    type="text"
                    value={editingSection.eyebrow || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, eyebrow: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. CALZARE SS26 DROP // ARCHITECTURAL FOAM"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Main Heading / Title</label>
                  <textarea
                    rows={2}
                    value={editingSection.title || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    className="admin-textarea"
                    placeholder="e.g. 0% BORING.\n100% AIR."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Subtitle / Narrative Summary</label>
                  <textarea
                    rows={3}
                    value={editingSection.subtitle || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                    className="admin-textarea"
                  />
                </div>

                {/* Hero Specific Controls */}
                {editingSection.sectionType === 'hero' && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Hero Banner Configuration
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Desktop Image / Media URL</label>
                      <input
                        type="text"
                        value={editingSection.config?.desktopMediaUrl || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            config: { ...editingSection.config, desktopMediaUrl: e.target.value },
                          })
                        }
                        className="admin-input"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Primary CTA Label</label>
                        <input
                          type="text"
                          value={editingSection.config?.primaryCtaLabel || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, primaryCtaLabel: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">CTA Target Route</label>
                        <input
                          type="text"
                          value={editingSection.config?.primaryCtaLink || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              config: { ...editingSection.config, primaryCtaLink: e.target.value },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Affordable Store Specific Controls */}
                {editingSection.sectionType === 'affordable_store' && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Price Filter Parameters
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-label">Maximum Price Cap (₹)</label>
                      <input
                        type="number"
                        value={editingSection.config?.priceCap || 999}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            config: { ...editingSection.config, priceCap: Number(e.target.value) },
                          })
                        }
                        className="admin-input"
                      />
                    </div>
                  </div>
                )}

                {saveSuccess && (
                  <div
                    style={{
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      marginBottom: '14px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle size={14} /> Changes published live to storefront!
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Publishing...' : 'Publish Section'}
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
