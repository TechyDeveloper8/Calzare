import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String },
    image: { type: String },
    bannerImage: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
