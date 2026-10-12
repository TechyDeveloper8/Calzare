import mongoose from 'mongoose';

const sizeChartSchema = new mongoose.Schema({
  title: { type: String, default: 'Standard Footwear Size Guide (UK/India)' },
  measurements: [
    {
      uk: { type: String, required: true },
      eu: { type: String },
      us: { type: String },
      footLengthCm: { type: Number, required: true },
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    barcode: { type: String },
    brand: { type: String, default: 'CALZARE', trim: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    material: { type: String, default: 'High-Density EVA / Waterproof Cushion Foam' },
    soleMaterial: { type: String, default: 'Anti-Slip Deep Lug EVA Sole' },
    closureType: { type: String, default: 'Slip-On' },
    weightGrams: { type: Number, default: 320 },
    warranty: { type: String, default: '6 Months Manufacturer Guarantee' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String },
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection', index: true }],
    tags: [{ type: String, index: true }],
    productType: {
      type: String,
      enum: ['Clogs', 'Sliders', 'Sandals', 'Sneakers', 'Foam Walkers', 'Accessories'],
      default: 'Clogs',
      index: true,
    },
    audience: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids'],
      default: 'Unisex',
      index: true,
    },
    baseRegularPrice: { type: Number, required: true },
    baseSalePrice: { type: Number, required: true },
    taxRatePercentage: { type: Number, default: 18 },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: true, index: true },
    salesCount: { type: Number, default: 0, index: true },
    viewsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    defaultImages: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isMain: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    videoUrl: { type: String },
    sizeChart: { type: sizeChartSchema },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for color variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId',
});

export const Product = mongoose.model('Product', productSchema);
