import React, { useState, useRef } from 'react';
import { api, getAssetUrl } from '../../api/api.js';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Star,
  Eye,
  Plus,
  Folder,
  FolderPlus,
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal.jsx';

/**
 * Single Image Direct Upload Component
 * Allows dragging, browsing files, or pasting URL directly into forms.
 */
export const ImageUploadField = ({
  value = '',
  onChange,
  label = 'Image',
  description = '',
  aspectRatio = 'auto',
  compact = false,
  required = false,
  previewHeight,
  objectFit = 'contain',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('files', file);

      const res = await api.adminUploadMedia(formData);
      if (res.success) {
        const uploadedUrl = res.url || res.assets?.[0]?.url || res.asset?.url;
        if (uploadedUrl) {
          onChange(getAssetUrl(uploadedUrl));
        } else {
          throw new Error('Upload succeeded but no URL was returned.');
        }
      } else {
        throw new Error(res.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Direct image upload error:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  const getAspectHeight = () => {
    if (aspectRatio === 'square') return '140px';
    if (aspectRatio === 'banner') return '110px';
    if (aspectRatio === 'hero') return '160px';
    return compact ? '90px' : '130px';
  };

  return (
    <div style={{ marginBottom: compact ? '8px' : '14px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="admin-label" style={{ marginBottom: 0, fontWeight: 600 }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#2563eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
              }}
            >
              <Folder size={11} /> Media Library
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                if (!showUrlInput) setUrlInputValue(value || '');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'underline',
              }}
            >
              <LinkIcon size={11} /> {showUrlInput ? 'Upload' : 'URL'}
            </button>
          </div>
        </div>
      )}

      {description && (
        <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '-2px 0 8px' }}>{description}</p>
      )}

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {showUrlInput ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="admin-input"
            style={{ flex: 1, fontSize: '0.82rem' }}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="admin-btn admin-btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="admin-btn admin-btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            Cancel
          </button>
        </div>
      ) : value ? (
        /* Preview State */
        <div
          style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: previewHeight ? (typeof previewHeight === 'number' ? `${previewHeight}px` : previewHeight) : getAspectHeight(),
            padding: objectFit === 'cover' ? '0' : '8px',
          }}
        >
          <img
            src={getAssetUrl(value)}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: objectFit === 'cover' ? '100%' : 'auto',
              height: objectFit === 'cover' ? '100%' : 'auto',
              objectFit: objectFit || 'contain',
              objectPosition: 'center',
              display: 'block',
              margin: 'auto',
            }}
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/400x300/f1f5f9/64748b?text=Image+Load+Error';
            }}
          />

          {/* Quick action buttons on preview */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              display: 'flex',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Replace image"
              style={{
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} className={uploading ? 'animate-spin' : ''} />
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              title="Select different image from media library"
              style={{
                color: '#93c5fd',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(37, 99, 235, 0.25)',
                cursor: 'pointer',
              }}
            >
              <Folder size={12} /> Library
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove image"
              style={{
                color: '#f87171',
                padding: '4px 6px',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>

          {/* Path info pill */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '6px',
              maxWidth: '75%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#e2e8f0',
              fontSize: '0.66rem',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {value.split('/').pop()}
          </div>
        </div>
      ) : (
        /* Empty / Upload Dropzone State */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #2563eb' : '1.5px dashed #cbd5e1',
            borderRadius: '8px',
            background: isDragging ? '#eff6ff' : '#f8fafc',
            padding: compact ? '12px 14px' : '18px 16px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
            height: getAspectHeight(),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={20} className="animate-spin" color="#2563eb" />
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                Uploading image directly...
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: compact ? '28px' : '36px',
                  height: compact ? '28px' : '36px',
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca',
                }}
              >
                <Upload size={compact ? 14 : 18} />
              </div>
              <div style={{ fontSize: compact ? '0.75rem' : '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                Click to upload or drag image here
              </div>
              {!compact && (
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  PNG, JPG, WEBP, SVG up to 25MB
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={(url) => {
          onChange(getAssetUrl(url));
          setShowMediaModal(false);
        }}
        title={`Select Asset for ${label || 'Field'}`}
      />
    </div>
  );
};

/**
 * Multi Image Gallery Direct Upload Component
 * Allows uploading multiple photos directly with thumbnail preview, cover selection, and deletion.
 */
export const MultiImageUploadField = ({
  images = [],
  onChange,
  label = 'Product Photography Gallery',
  description = 'Directly upload high-resolution product angles (front, side, sole, lifestyle).',
  maxImages = 12,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          formData.append('files', files[i]);
        }
      }

      const res = await api.adminUploadMedia(formData);
      if (res.success) {
        const uploadedAssets = res.assets || (res.asset ? [res.asset] : []);
        const newImages = uploadedAssets.map((asset, idx) => ({
          url: getAssetUrl(asset.url),
          alt: asset.altText || asset.title || 'Product Photo',
          isMain: images.length === 0 && idx === 0,
        }));

        onChange([...images, ...newImages]);
      } else {
        throw new Error(res.message || 'Failed to upload images');
      }
    } catch (err) {
      console.error('Multi image upload error:', err);
      setError(err.message || 'Failed to upload selected images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (idxToRemove) => {
    const updated = images.filter((_, idx) => idx !== idxToRemove);
    // If we removed the main image, make the first remaining image main
    if (images[idxToRemove]?.isMain && updated.length > 0) {
      updated[0].isMain = true;
    }
    onChange(updated);
  };

  const handleSetMain = (idxToMain) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isMain: idx === idxToMain,
    }));
    onChange(updated);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div>
          <label className="admin-label" style={{ marginBottom: '2px', fontWeight: 600 }}>
            {label}
          </label>
          {description && (
            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>{description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '0.78rem', gap: '6px' }}
          >
            {uploading ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.76rem',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Grid of Images + Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          background: isDragging ? '#eff6ff' : '#f8fafc',
          border: isDragging ? '2px dashed #2563eb' : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '14px',
          minHeight: '130px',
          transition: 'all 0.15s ease',
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#f8fafc',
              border: img.isMain ? '2px solid #2563eb' : '1px solid #cbd5e1',
              boxShadow: img.isMain ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            <img
              src={getAssetUrl(img.url)}
              alt={img.alt || `Product ${idx + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                margin: 'auto',
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/200x200/f1f5f9/64748b?text=Broken+Image';
              }}
            />

            {/* Main Badge */}
            {img.isMain && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Star size={10} fill="#ffffff" /> MAIN
              </span>
            )}

            {/* Actions Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(3px)',
                padding: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!img.isMain ? (
                <button
                  type="button"
                  onClick={() => handleSetMain(idx)}
                  title="Set as Main Cover Photo"
                  style={{
                    color: '#e2e8f0',
                    fontSize: '0.64rem',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <Star size={10} /> Make Main
                </button>
              ) : (
                <span style={{ fontSize: '0.62rem', color: '#93c5fd', paddingLeft: '4px' }}>
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                title="Delete Photo"
                style={{
                  color: '#f87171',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {/* Dropzone tile */}
        {images.length < maxImages && (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              borderRadius: '8px',
              border: '1.5px dashed #cbd5e1',
              background: '#ffffff',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              color: '#64748b',
              gap: '4px',
              padding: '8px',
              textAlign: 'center',
              transition: 'border-color 0.15s ease',
            }}
          >
            {uploading ? (
              <RefreshCw size={20} className="animate-spin" color="#2563eb" />
            ) : (
              <>
                <Upload size={18} color="#94a3b8" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>+ Add Photo</span>
                <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>or drag here</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
