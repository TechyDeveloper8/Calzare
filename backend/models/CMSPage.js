import mongoose from 'mongoose';

const cmsPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    category: {
      type: String,
      enum: ['policy', 'info', 'guide', 'legal', 'journal'],
      default: 'info',
    },
    heroImage: { type: String },
    author: { type: String, default: 'CALZARE Editorial' },
    readTime: { type: String, default: '3 min read' },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

export const CMSPage = mongoose.model('CMSPage', cmsPageSchema);
