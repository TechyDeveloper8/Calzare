import { MediaAsset } from '../models/MediaAsset.js';
import path from 'path';
import fs from 'fs';
import { logAudit } from '../utils/auditLogger.js';

export const getBackendBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, '');
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '');
  }
  if (req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host) {
      return `${protocol}://${host}`.replace(/\/+$/, '');
    }
  }
  return 'https://calzare.onrender.com';
};

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const files = req.files || [req.file];
    const uploadedAssets = [];
    const baseUrl = getBackendBaseUrl(req);

    for (const file of files) {
      const isVideo = file.mimetype.startsWith('video/');
      const fullFileUrl = `${baseUrl}/uploads/${file.filename}`;

      const asset = await MediaAsset.create({
        title: path.parse(file.originalname).name,
        filename: file.filename,
        originalName: file.originalname,
        url: fullFileUrl,
        fileType: isVideo ? 'video' : 'image',
        mimeType: file.mimetype,
        sizeBytes: file.size,
        altText: req.body.altText || path.parse(file.originalname).name,
        folder: req.body.folder || 'general',
        uploadedBy: req.user?._id,
      });

      uploadedAssets.push(asset);
    }

    await logAudit(req, 'UPLOAD_MEDIA', 'MediaAsset', 'batch', { count: uploadedAssets.length });

    res.status(201).json({
      success: true,
      url: uploadedAssets[0]?.url,
      urls: uploadedAssets.map((a) => a.url),
      assets: uploadedAssets,
      asset: uploadedAssets[0],
      message: 'Media uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaAssets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const { fileType, folder, search } = req.query;

    const query = {};
    if (fileType) query.fileType = fileType;
    if (folder) query.folder = folder;
    if (search) {
      query.$or = [{ title: new RegExp(search, 'i') }, { filename: new RegExp(search, 'i') }, { altText: new RegExp(search, 'i') }];
    }

    const total = await MediaAsset.countDocuments(query);
    const assets = await MediaAsset.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const baseUrl = getBackendBaseUrl(req);
    const normalizedAssets = assets.map((asset) => {
      const obj = asset.toObject ? asset.toObject() : { ...asset };
      if (obj.url && obj.url.startsWith('/uploads/')) {
        obj.url = `${baseUrl}${obj.url}`;
      }
      return obj;
    });

    res.json({
      success: true,
      assets: normalizedAssets,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMediaAsset = async (req, res, next) => {
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    // Try deleting file from disk if local
    try {
      const diskPath = path.join(process.cwd(), 'uploads', asset.filename);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (e) {
      console.warn('Could not delete file from disk:', e.message);
    }

    await asset.deleteOne();
    await logAudit(req, 'DELETE_MEDIA', 'MediaAsset', req.params.id);

    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    next(error);
  }
};
