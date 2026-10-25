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
      enum: ['manual', 'price_under', 'tag_match', 'category_match', 'audience_match'],
      default: 'manual',
    },
    ruleValue: { type: String }, // e.g. "999" for price_under, or "Men" for audience_match
    manualProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    hero: {
      label: { type: String, default: "THE MEN'S EDIT" },
      heading: { type: String, default: 'BUILT TO STAND OUT.' },
      supportingText: { type: String, default: 'Everyday comfort. Zero ordinary energy.' },
      desktopBannerUrl: { type: String, default: '' },
      mobileBannerUrl: { type: String, default: '' },
      imagePosition: { type: String, default: 'center center' },
      background: { type: String, default: 'editorial_minimal' }, // 'editorial_minimal', 'warm_cream', 'dark_canvas'
      ctaText: { type: String, default: '' },
      ctaLink: { type: String, default: '' },
      isVisible: { type: Boolean, default: true },
    },
    categoryShortcuts: [
      {
        label: { type: String },
        slug: { type: String },
        isEnabled: { type: Boolean, default: true },
      },
    ],
    editorialBanner: {
      isEnabled: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: true },
      eyebrow: { type: String, default: '' },
      heading: { type: String, default: '' },
      bodyText: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      ctaText: { type: String, default: '' },
      ctaLink: { type: String, default: '' },
    },
    seoTitle: { type: String },
    seoDescription: { type: String },
    brandComparison: {
      isEnabled: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: true },
      heading: { type: String, default: 'SEE THE DIFFERENCE' },
      subheading: {
        type: String,
        default: 'How CALZARE monolithic closed-cell foam compares to standard footwear',
      },
      desktopMediaUrl: { type: String, default: '' },
      mobileMediaUrl: { type: String, default: '' },
      altText: { type: String, default: 'Brand comparison' },
      displayOrder: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

collectionSchema.index({ isPublished: 1, displayOrder: 1 });
collectionSchema.index({ slug: 1, isPublished: 1 });

export const Collection = mongoose.model('Collection', collectionSchema);
