import mongoose from 'mongoose';

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'CALZARE Footwear' },
    tagline: { type: String, default: 'Good Shoes. Loud Personality.' },
    contactEmail: { type: String, default: 'concierge@calzarefootwear.com' },
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
  },
  { timestamps: true }
);

export const StoreSetting = mongoose.model('StoreSetting', storeSettingSchema);
