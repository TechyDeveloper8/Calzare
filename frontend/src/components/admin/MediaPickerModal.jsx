import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../api/api.js';
import {
  Image as ImageIcon,
  Search,
  X,
  Check,
  Upload,
  RefreshCw,
  Folder,
  AlertCircle,
  Film,
} from 'lucide-react';

export const MediaPickerModal = ({ isOpen, onClose, onSelect, title = 'Select from Media Library' }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const query = { fileType: 'image' };
      if (search) query.search = search;
      if (selectedFolder) query.folder = selectedFolder;
      const res = await api.adminGetMedia(query);
      if (res.success) {
        setAssets(res.assets || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch media assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, selectedFolder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleQuickUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', 'comparison');
      const res = await api.adminUploadMedia(formData);
      if (res.success) {
        const uploadedUrl = res.url || res.assets?.[0]?.url || res.asset?.url;
        if (uploadedUrl) {
          onSelect(getAssetUrl(uploadedUrl));
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Quick upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {title}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Choose an existing image asset or upload a new one directly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media by title or keyword..."
                className="admin-input"
                style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '0 14px', fontSize: '0.78rem' }}>
              Search
            </button>
          </form>

          <label
            className="admin-btn admin-btn-outline"
            style={{ cursor: uploading ? 'wait' : 'pointer', padding: '0 14px', height: '36px', fontSize: '0.78rem', gap: '6px' }}
          >
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload New'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={handleQuickUpload}
            />
          </label>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '0.84rem' }}>Loading media assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <ImageIcon size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#1e293b' }}>
                No image assets found
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Upload an image or adjust your search term.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '14px',
              }}
            >
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  onClick={() => {
                    onSelect(getAssetUrl(asset.url));
                    onClose();
                  }}
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(37, 99, 235, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      height: '110px',
                      background: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={getAssetUrl(asset.url)}
                      alt={asset.altText || asset.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        background: '#f8fafc',
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/160x110/f1f5f9/64748b?text=Asset';
                      }}
                    />
                  </div>

                  <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={asset.title || asset.originalName}
                    >
                      {asset.title || asset.originalName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.66rem',
                        color: '#64748b',
                        marginTop: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {asset.dimensions?.width && asset.dimensions?.height
                          ? `${asset.dimensions.width}×${asset.dimensions.height}`
                          : asset.folder || 'media'}
                      </span>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>Select</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '0.8rem', padding: '6px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
