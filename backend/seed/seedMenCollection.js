import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Collection } from '../models/Collection.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

async function seedMenCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    const existing = await Collection.findOne({ slug: 'men' });

    const menData = {
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
    };

    if (existing) {
      Object.assign(existing, menData);
      await existing.save();
      console.log('Updated existing Men collection record in MongoDB');
    } else {
      await Collection.create(menData);
      console.log('Created new Men collection record in MongoDB');
    }

    await mongoose.disconnect();
    console.log('Disconnected cleanly from MongoDB');
  } catch (err) {
    console.error('Error seeding Men collection:', err);
    process.exit(1);
  }
}

seedMenCollection();
