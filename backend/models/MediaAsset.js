import mongoose from 'mongoose';

const mediaAssetSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    filename: { type: String, required: true },
    originalName: { type: String },
    url: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
    mimeType: { type: String },
    sizeBytes: { type: Number },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    altText: { type: String, default: '' },
    folder: { type: String, default: 'general', index: true },
    tags: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);
