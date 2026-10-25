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
    tagline: { type: String, default: '' },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Group 2: Main product-page copy overrides
    customCopy: {
      eyebrow: { type: String, default: '' },
      titleOverride: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      sellingStatement: { type: String, default: '' },
      priceLabel: { type: String, default: '' },
      offerHeading: { type: String, default: '' },
      offerDescription: { type: String, default: '' },
      addToCartText: { type: String, default: '' },
      buyNowText: { type: String, default: '' },
      outOfStockMessage: { type: String, default: '' },
      lowStockThreshold: { type: Number, default: 5 },
      lowStockMessage: { type: String, default: '' },
      colorHeading: { type: String, default: '' },
      sizeHeading: { type: String, default: '' },
      sizeGuideButtonText: { type: String, default: '' },
      deliveryCheckHeading: { type: String, default: '' },
      deliveryCheckPlaceholder: { type: String, default: '' },
      deliveryCheckButtonText: { type: String, default: '' },
      shippingHeading: { type: String, default: '' },
      dispatchInfo: { type: String, default: '' },
      deliveryGuidance: { type: String, default: '' },
      codMessage: { type: String, default: '' },
      returnHeading: { type: String, default: '' },
      returnPolicy: { type: String, default: '' },
      faqHeading: { type: String, default: '' },
      relatedProductsHeading: { type: String, default: '' },
      relatedProductsSubtitle: { type: String, default: '' },
    },

    // Group 3: Product Storytelling repeatable blocks
    storytellingBlocks: [
      {
        heading: { type: String },
        subheading: { type: String },
        body: { type: String },
        imageUrl: { type: String },
        imageAlt: { type: String },
        videoUrl: { type: String },
        layout: {
          type: String,
          enum: ['text_only', 'image_left', 'image_right', 'full_width_media'],
          default: 'image_right',
        },
        isEnabled: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
      },
    ],

    // Group 4: Key features with icon, description, and visibility
    richFeatures: [
      {
        icon: { type: String, default: 'Sparkles' },
        heading: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        isVisible: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],

    // Group 5: Materials, Fit, Care & Detailed Specifications
    materialsAndCare: {
      material: { type: String },
      construction: { type: String },
      fitDescription: { type: String },
      comfortDetails: { type: String },
      careInstructions: { type: String },
      warranty: { type: String },
      isVisible: { type: Boolean, default: true },
    },

    specifications: [
      {
        name: { type: String },
        value: { type: String },
        isVisible: { type: Boolean, default: true },
      },
    ],

    // Group 6: Size guide configuration
    sizeGuideConfig: {
      title: { type: String, default: 'Standard Footwear Size Guide (UK/India)' },
      instructions: {
        type: String,
        default:
          'Place your foot flat on a sheet of paper. Mark the tip of your longest toe and the back of your heel, then measure the distance in centimeters.',
      },
      measurementUnit: { type: String, default: 'cm' },
      chartImageUrl: { type: String },
      isVisible: { type: Boolean, default: true },
    },

    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    storytelling: {
      headline: { type: String },
      copy: { type: String },
      quote: { type: String },
      image: { type: String },
      stats: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
    },

    // Group 11: Product-level Brand Comparison section override
    brandComparison: {
      mode: {
        type: String,
        enum: ['inherit', 'custom', 'disabled'],
        default: 'inherit',
      },
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

// High-concurrency compound query indexes
productSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({ status: 1, salesCount: -1, averageRating: -1 });
productSchema.index({ status: 1, audience: 1, baseSalePrice: 1 });
productSchema.index({ status: 1, category: 1 });
productSchema.index({ status: 1, baseSalePrice: 1 });

export const Product = mongoose.model('Product', productSchema);
