import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      // e.g. "hero_main", "trust_ticker", "bestsellers", "shop_audience", "affordable_store", "storytelling", "category_discovery", "customer_reviews", "benefits_trust", "newsletter"
    },
    sectionType: {
      type: String,
      required: true,
      enum: [
        'hero',
        'ticker',
        'bestsellers',
        'audience_cards',
        'shop_split',
        'affordable_store',
        'storytelling',
        'category_discovery',
        'recommendations',
        'reviews',
        'benefits',
        'newsletter',
        'custom_banner',
      ],
      index: true,
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    displayOrder: { type: Number, default: 0, index: true },
    isEnabled: { type: Boolean, default: true, index: true },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },

    // Deep dynamic configuration payload for styling, media, layout variants, and content
    config: {
      // Art Direction & Styling
      layoutVariant: { type: String, default: 'asymmetric_editorial' }, // e.g. 'asymmetric_editorial', 'full_bleed', 'floating_cutout', 'split_video'
      backgroundTreatment: { type: String, default: 'warm_cream' }, // 'warm_cream', 'ink_black', 'stone_light', 'split_duo'
      glassIntensity: { type: String, default: 'subtle' }, // 'none', 'subtle', 'medium', 'deep'
      accentColor: { type: String, default: '#d8ff00' }, // electric lime default, or custom hex
      textColor: { type: String, default: '#121212' },
      overlayOpacity: { type: Number, default: 0.15 },

      // Hero specific
      desktopMediaUrl: { type: String },
      mobileMediaUrl: { type: String },
      mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
      videoPosterUrl: { type: String },
      primaryCtaLabel: { type: String, default: 'EXPLORE DROP' },
      primaryCtaLink: { type: String, default: '/shop' },
      secondaryCtaLabel: { type: String },
      secondaryCtaLink: { type: String },
      stickers: [
        {
          text: { type: String },
          badgeStyle: { type: String }, // 'lime_pill', 'black_stamp', 'glass_float'
          position: { type: String }, // 'top_right', 'bottom_left'
        },
      ],

      // Ticker specific
      tickerMessages: [
        {
          id: { type: String },
          text: { type: String },
          highlight: { type: String },
          iconName: { type: String },
          link: { type: String },
        },
      ],
      tickerSpeed: { type: Number, default: 28 }, // seconds per loop
      tickerDirection: { type: String, enum: ['left', 'right'], default: 'left' },

      // Product / Collection based sections
      productSource: { type: String, enum: ['auto_bestseller', 'manual_select', 'collection_slug', 'price_filter'], default: 'auto_bestseller' },
      selectedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      collectionSlug: { type: String },
      priceCap: { type: Number, default: 999 },
      maxProducts: { type: Number, default: 8 },
      columnsDesktop: { type: Number, default: 4 },
      columnsMobile: { type: Number, default: 2 },
      sortBy: { type: String, default: 'price_asc' },
      campaignBadge: { type: String, default: '' },
      focalPoint: { type: String, default: 'center' },
      overlayTint: { type: String, default: 'rgba(0, 0, 0, 0.45)' },

      // Audience cards & Shop Split Panels
      audienceCards: [
        {
          id: { type: String },
          title: { type: String },
          tagline: { type: String },
          text: { type: String },
          imageUrl: { type: String },
          mobileImageUrl: { type: String },
          altText: { type: String },
          ctaLabel: { type: String },
          link: { type: String },
          badge: { type: String },
          objectPosition: { type: String, default: 'center bottom' },
          textAlign: { type: String, default: 'left' },
          contrastMode: { type: String, default: 'shadow_gradient' }, // 'shadow_gradient', 'dark_overlay', 'none'
          isEnabled: { type: Boolean, default: true },
          isPublished: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      categoryPanels: [
        {
          id: { type: String },
          title: { type: String },
          text: { type: String },
          tagline: { type: String },
          imageUrl: { type: String },
          mobileImageUrl: { type: String },
          altText: { type: String },
          ctaLabel: { type: String },
          link: { type: String },
          objectPosition: { type: String, default: 'center bottom' },
          textAlign: { type: String, default: 'left' },
          contrastMode: { type: String, default: 'shadow_gradient' },
          isEnabled: { type: Boolean, default: true },
          isPublished: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],

      // Storytelling & Brand Blocks
      storytelling: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      // Category discovery cards
      categoryTiles: [
        {
          id: { type: String },
          title: { type: String },
          subtitle: { type: String },
          imageUrl: { type: String },
          link: { type: String },
        },
      ],

      // Benefits blocks
      benefitItems: [
        {
          id: { type: String },
          iconName: { type: String },
          title: { type: String },
          description: { type: String },
        },
      ],
    },

    // Versioning & rollback
    publishedVersion: { type: Number, default: 1 },
    draftConfig: { type: Object },
    isDraftAvailable: { type: Boolean, default: false },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);
