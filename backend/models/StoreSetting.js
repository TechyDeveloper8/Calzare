import mongoose from 'mongoose';

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'CALZARE Footwear' },
    tagline: { type: String, default: 'Good Shoes. Loud Personality.' },
    legalCompanyName: { type: String, default: 'Calzare Heels Private Limited' },
    websiteUrl: { type: String, default: 'calzare.in' },
    contactEmail: { type: String, default: 'Admin@calzareheels.com' },
    contactPhone: { type: String, default: '+91 98765 43210' },
    businessAddress: { type: String, default: 'CALZARE Design Lab, Indiranagar, Bengaluru, KA 560038' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },

    // Shipping rules
    freeShippingThreshold: { type: Number, default: 999 },
    defaultShippingFee: { type: Number, default: 99 },
    codEnabled: { type: Boolean, default: true },
    codFee: { type: Number, default: 49 },
    taxRatePercentage: { type: Number, default: 18 },

    // FShip Logistics Aggregator Integration (https://app.fship.in)
    fship: {
      enabled: { type: Boolean, default: true },
      apiKey: { type: String, default: '68e1a2b5a61128696f34531432751be18eaea96aea6ea1aa093ff8b54c4b0507' },
      baseUrl: { type: String, default: 'https://capi.fship.in' },
      pickupPincode: { type: String, default: '560038' },
      defaultCourier: { type: String, default: 'auto' },
    },

    // Payment Gateway Settings
    razorpayEnabled: { type: Boolean, default: true },
    razorpayKeyId: { type: String, default: 'rzp_test_calzare12345' },

    // Creative Theme Tokens (For dynamic theme controls)
    themeTokens: {
      primaryAccent: { type: String, default: '#d8ff00' }, // Electric lime
      secondaryAccent: { type: String, default: '#ff5d2b' }, // Tangerine
      darkCanvas: { type: String, default: '#0f0f10' }, // Ink black
      lightCanvas: { type: String, default: '#f8f6f0' }, // Warm cream
      glassmorphismIntensity: { type: String, default: 'subtle' }, // 'none', 'subtle', 'medium', 'deep'
    },

    // Marketing & Analytics
    googleAnalyticsId: { type: String, default: '' },
    metaPixelId: { type: String, default: '' },
    googleSearchConsoleVerification: { type: String, default: '' },

    // Global Product Page Copy Defaults (resolution: product override -> global default -> app fallback)
    productPageDefaults: {
      breadcrumbHome: { type: String, default: 'Home' },
      breadcrumbCatalog: { type: String, default: 'Footwear' },
      addToCartText: { type: String, default: 'ADD TO BAG' },
      buyNowText: { type: String, default: 'BUY IT NOW' },
      outOfStockText: { type: String, default: 'SOLD OUT' },
      lowStockText: { type: String, default: 'Only a few pairs left in stock!' },
      colorSelectorHeading: { type: String, default: 'Select Colorway' },
      sizeSelectorHeading: { type: String, default: 'Select Size (UK/India)' },
      sizeGuideButtonText: { type: String, default: 'Size & Fit Guide' },
      quantityHeading: { type: String, default: 'Quantity' },
      deliveryCheckHeading: { type: String, default: 'Estimate Delivery & Serviceability' },
      deliveryCheckPlaceholder: { type: String, default: 'Enter 6-digit Pincode' },
      deliveryCheckButtonText: { type: String, default: 'CHECK' },
      shippingHeading: { type: String, default: 'Shipping & Delivery' },
      dispatchInfo: { type: String, default: 'Orders processed within 1–2 business days. Estimated delivery 3–7 business days after dispatch across India.' },
      deliveryGuidance: { type: String, default: 'Tracking link sent via SMS/Email upon dispatch. Real-time courier updates available.' },
      codMessage: { type: String, default: 'Cash on Delivery (COD) & Partial COD available for eligible PIN codes across India.' },
      returnsHeading: { type: String, default: 'Refund, Return & Exchange Policy' },
      returnPolicy: { type: String, default: 'Size exchanges accepted within 3 days of delivery (disclosed exchange fee of ₹149 applies to help cover shipping & logistics). Damaged, defective, or incorrect items must be reported within 48 hours of delivery (unboxing video recommended). No fees charged when attributable to CALZARE™.' },
      relatedProductsHeading: { type: String, default: 'YOU MIGHT ALSO LIKE' },
      reviewsHeading: { type: String, default: 'VERIFIED CUSTOMER REVIEWS' },
      faqsHeading: { type: String, default: 'FREQUENTLY ASKED QUESTIONS' },
      trustBadge1: { type: String, default: 'Free Express Shipping Across India' },
      trustBadge2: { type: String, default: '3-Day Doorstep Size Exchange (₹149 Fee)' },
      trustBadge3: { type: String, default: '100% Genuine CALZARE™ Footwear' },
      trustBadge4: { type: String, default: 'Cash on Delivery & Partial COD Available' },
    },

    // Global Brand Comparison Default ("See the Difference")
    brandComparisonDefault: {
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
      scope: {
        type: String,
        enum: ['all', 'selected_products', 'selected_collections'],
        default: 'all',
      },
      selectedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      selectedCollectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    },
  },
  { timestamps: true }
);

export const StoreSetting = mongoose.model('StoreSetting', storeSettingSchema);
