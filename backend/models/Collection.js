import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String },
    heroMedia: {
      type: { type: String, enum: ['image', 'video'], default: 'image' },
      url: { type: String },
      mobileUrl: { type: String },
      alt: { type: String },
    },
    bannerImage: { type: String },
    displayOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
    isFeaturedOnHome: { type: Boolean, default: false },
    ruleType: {
      type: String,
      enum: ['manual', 'price_under', 'tag_match', 'category_match'],
      default: 'manual',
    },
    ruleValue: { type: String }, // e.g. "999" for price_under, or "bestseller" for tag_match
    manualProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

export const Collection = mongoose.model('Collection', collectionSchema);
