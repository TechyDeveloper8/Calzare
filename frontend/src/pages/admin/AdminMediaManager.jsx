import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api.js';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  Film,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const AdminMediaManager = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const query = {};
      if (searchTerm) query.search = searchTerm;
      if (fileTypeFilter) query.fileType = fileTypeFilter;
      const res = await api.adminGetMedia(query);
      if (res.success) {
        setAssets(res.assets || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [fileTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploading(true);
      const res = await api.adminUploadMedia(formData);
      if (res.success) {
        fetchAssets();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (url, id) => {
    // If relative path, prepend window.location.origin
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete media asset "${title}"?`)) return;
    try {
      await api.adminDeleteMedia(id);
      setAssets(assets.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media Asset Library</h1>
          <p className="admin-page-subtitle">
            Upload and organize high-resolution product photography, campaign videos, and banner graphics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn admin-btn-primary"
            disabled={uploading}
            style={{ gap: '6px' }}
          >
            <Upload size={16} /> {uploading ? 'Uploading Assets...' : 'Upload Media Files'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '6px' }} /> {error}
        </div>
      )}

      {/* Upload Zone & Filter */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 300px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search assets by title, filename, or alt text..."
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
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="admin-select"
              style={{ minWidth: '150px' }}
            >
              <option value="">All Media Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Asset Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
          Loading media library...
        </div>
      ) : assets.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <ImageIcon size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No media assets found</h3>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
            Upload campaign photos or product videos to use across the storefront
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', gap: '6px' }}
          >
            <Upload size={16} /> Upload First File
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="admin-card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                position: 'relative',
              }}
            >
              {/* Media Preview Box */}
              <div
                style={{
                  height: '160px',
                  background: '#f4f4f4',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {asset.fileType === 'video' ? (
                  <video
                    src={asset.url}
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}

                {/* Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {asset.fileType === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                  {asset.mimeType?.split('/')[1] || asset.fileType}
                </div>
              </div>

              {/* Meta details */}
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={asset.title}
                  >
                    {asset.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                    {formatSize(asset.sizeBytes)} • {new Date(asset.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>

                {/* Actions row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => copyToClipboard(asset.url, asset._id)}
                    className="admin-btn admin-btn-outline"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      gap: '4px',
                      background: copiedId === asset._id ? '#ecfdf5' : 'transparent',
                      color: copiedId === asset._id ? '#047857' : 'inherit',
                      borderColor: copiedId === asset._id ? '#a7f3d0' : '#e2e8f0',
                    }}
                  >
                    {copiedId === asset._id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === asset._id ? 'Copied URL!' : 'Copy URL'}
                  </button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '4px 6px', color: '#555' }}
                      title="Open full resolution"
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleDelete(asset._id, asset.title)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '4px 6px', color: '#dc2626', borderColor: '#fca5a5' }}
                      title="Delete asset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
