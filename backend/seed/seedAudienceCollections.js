import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Collection } from '../models/Collection.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

const audienceCollections = [
  {
    name: "MEN'S FOOTWEAR EDIT",
    slug: 'men',
    description: 'Heavy-duty arch contoured clogs, platform slides, and waterproof trail sandals built for masculine proportions and all-day movement.',
    ruleType: 'audience_match',
    ruleValue: 'Men',
    hero: {
      label: "THE MEN'S EDIT",
      heading: 'BUILT TO STAND OUT.',
      supportingText: 'Everyday comfort. Zero ordinary energy.',
      desktopBannerUrl: '/images/split/men-collection-image.jpg',
      mobileBannerUrl: '',
      imagePosition: 'center center',
      background: 'editorial_minimal',
      ctaText: 'EXPLORE DROP',
      ctaLink: '#collection-grid',
      isVisible: true,
    },
    categoryShortcuts: [
      { label: 'All Footwear', slug: 'all', isEnabled: true },
      { label: 'Clogs', slug: 'clogs', isEnabled: true },
      { label: 'Sliders', slug: 'sliders', isEnabled: true },
      { label: 'Sandals', slug: 'sandals', isEnabled: true },
      { label: 'Foam Walkers', slug: 'foam-walkers', isEnabled: true },
    ],
    editorialBanner: {
      isEnabled: false,
      isPublished: true,
      eyebrow: 'ARCHITECTURE & MOVEMENT',
      heading: 'BUILT DIFFERENT FOR THE CITY TRENCHES.',
      bodyText: 'Monolithic closed-cell EVA foam engineered with dual-density arch contouring. Zero squeaks, zero break-in period.',
      imageUrl: '/images/split/men-collection-image.jpg',
      ctaText: 'LEARN MORE',
      ctaLink: '/about',
    },
    seoTitle: "Men's Footwear Edit | CALZARE",
    seoDescription: "Discover the CALZARE Men's collection: ergonomic clogs, slides, and sandals engineered for all-day comfort and bold streetwear style.",
    isPublished: true,
    displayOrder: 1,
  },
  {
    name: "WOMEN'S FOOTWEAR EDIT",
    slug: 'women',
    description: 'Ultra-lightweight platform mules, pastel clogs, and ergonomic rebound slides crafted for effortless everyday street style.',
    ruleType: 'audience_match',
    ruleValue: 'Women',
    hero: {
      label: "THE WOMEN'S EDIT",
      heading: 'EFFORTLESS REBOUND.',
      supportingText: 'No laces, no rush — comfort that clocks off exactly when you do.',
      desktopBannerUrl: '/images/split/women-collection-image.jpg',
      mobileBannerUrl: '',
      imagePosition: 'center center',
      background: 'editorial_minimal',
      ctaText: 'EXPLORE DROP',
      ctaLink: '#collection-grid',
      isVisible: true,
    },
    categoryShortcuts: [
      { label: 'All Footwear', slug: 'all', isEnabled: true },
      { label: 'Clogs', slug: 'clogs', isEnabled: true },
      { label: 'Sliders', slug: 'sliders', isEnabled: true },
      { label: 'Sandals', slug: 'sandals', isEnabled: true },
      { label: 'Foam Walkers', slug: 'foam-walkers', isEnabled: true },
    ],
    editorialBanner: {
      isEnabled: false,
      isPublished: true,
      eyebrow: 'SCULPTED ELEGANCE',
      heading: 'EFFORTLESS COMFORT, ELEVATED MOVEMENT.',
      bodyText: 'Featherlight closed-cell EVA platforms crafted to elevate everyday style without foot fatigue.',
      imageUrl: '/images/split/women-collection-image.jpg',
      ctaText: 'LEARN MORE',
      ctaLink: '/about',
    },
    seoTitle: "Women's Footwear Edit | CALZARE",
    seoDescription: "Discover CALZARE Women's collection: ergonomic clogs, platform slides, and sandals engineered for all-day comfort and street-ready style.",
    isPublished: true,
    displayOrder: 2,
  },
  {
    name: "KIDS' FOOTWEAR COLLECTION",
    slug: 'kids',
    description: 'Playproof, featherlight, and non-slip clogs and slides designed for growing feet, endless jumping, and everyday adventures.',
    ruleType: 'audience_match',
    ruleValue: 'Kids',
    hero: {
      label: "THE KIDS' EDIT",
      heading: 'BUILT FOR PLAY.',
      supportingText: 'Featherlight, washable, and ultra-durable comfort for little explorers everywhere.',
      desktopBannerUrl: '/images/split/kids-collection-image.jpg',
      mobileBannerUrl: '',
      imagePosition: 'center center',
      background: 'editorial_minimal',
      ctaText: 'EXPLORE DROP',
      ctaLink: '#collection-grid',
      isVisible: true,
    },
    categoryShortcuts: [
      { label: 'All Footwear', slug: 'all', isEnabled: true },
      { label: 'Clogs', slug: 'clogs', isEnabled: true },
      { label: 'Sliders', slug: 'sliders', isEnabled: true },
      { label: 'Sandals', slug: 'sandals', isEnabled: true },
    ],
    editorialBanner: {
      isEnabled: false,
      isPublished: true,
      eyebrow: 'PLAYTIME RE-ENGINEERED',
      heading: '100% WATERPROOF. 100% ADVENTURE-READY.',
      bodyText: 'Non-toxic, slip-resistant monolithic EVA foam that cleans in seconds under running water.',
      imageUrl: '/images/split/kids-collection-image.jpg',
      ctaText: 'LEARN MORE',
      ctaLink: '/about',
    },
    seoTitle: "Kids' Footwear Collection | CALZARE",
    seoDescription: "Shop CALZARE Kids' footwear: lightweight, washable, and supportive clogs and slides built for non-stop play and comfort.",
    isPublished: true,
    displayOrder: 3,
  },
  {
    name: "UNISEX ARCHITECTURAL SERIES",
    slug: 'unisex',
    description: 'Clean lines and universal proportions sculpted in monolithic EVA foam for every foot and every stride.',
    ruleType: 'audience_match',
    ruleValue: 'Unisex',
    hero: {
      label: "THE UNISEX EDIT",
      heading: 'UNIVERSAL FORM. PURE FUNCTION.',
      supportingText: 'Sculpted footwear engineered for all identities, all terrains, and all-day ease.',
      desktopBannerUrl: '/images/split/unisex-collection-image.jpg',
      mobileBannerUrl: '',
      imagePosition: 'center center',
      background: 'editorial_minimal',
      ctaText: 'EXPLORE DROP',
      ctaLink: '#collection-grid',
      isVisible: true,
    },
    categoryShortcuts: [
      { label: 'All Footwear', slug: 'all', isEnabled: true },
      { label: 'Clogs', slug: 'clogs', isEnabled: true },
      { label: 'Sliders', slug: 'sliders', isEnabled: true },
    ],
    seoTitle: "Unisex Architectural Footwear | CALZARE",
    seoDescription: "Universal monolithic EVA clogs and slides designed for modern comfort and all genders.",
    isPublished: true,
    displayOrder: 4,
  },
];

async function seedAudienceCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    for (const data of audienceCollections) {
      const existing = await Collection.findOne({ slug: data.slug });
      if (existing) {
        // If it exists, merge data while preserving any customized hero image or text already saved
        existing.name = data.name;
        existing.description = existing.description || data.description;
        existing.ruleType = data.ruleType;
        existing.ruleValue = data.ruleValue;
        existing.isPublished = true;
        if (!existing.hero || !existing.hero.heading) {
          existing.hero = data.hero;
        } else {
          // ensure fields like desktopBannerUrl exist
          existing.hero.desktopBannerUrl = existing.hero.desktopBannerUrl || data.hero.desktopBannerUrl;
          existing.hero.label = existing.hero.label || data.hero.label;
          existing.hero.heading = existing.hero.heading || data.hero.heading;
          existing.hero.supportingText = existing.hero.supportingText || data.hero.supportingText;
          existing.hero.ctaText = existing.hero.ctaText || data.hero.ctaText;
          existing.hero.ctaLink = existing.hero.ctaLink || data.hero.ctaLink;
          existing.hero.isVisible = existing.hero.isVisible !== false;
        }
        await existing.save();
        console.log(`[Synced] Collection: ${data.slug} (${data.name})`);
      } else {
        await Collection.create(data);
        console.log(`[Created] Collection: ${data.slug} (${data.name})`);
      }
    }

    console.log('All audience collections seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding audience collections:', err);
    process.exit(1);
  }
}

seedAudienceCollections();
