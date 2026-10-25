import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { HomepageSection } from '../models/HomepageSection.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

async function updateSection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const updateData = {
      eyebrow: '',
      title: 'Your day\nfound its footing.',
      subtitle: 'Everyday Sola, everyday price.\nStarting ₹999',
      'config.campaignHeadline': 'Your day\nfound its footing.',
      'config.campaignDescription': 'Everyday Sola, everyday price.\nStarting ₹999',
      'config.primaryCtaLabel': 'EXPLORE',
      'config.primaryCtaLink': '/collections/all',
      'config.desktopMediaUrl': '/images/store999/promo.jpg',
      'config.mobileMediaUrl': '/images/store999/promo.jpg',
      'config.badgeImageUrl': '/images/store999/badge.png',
      'config.promoBgColor': '#0147af',
      'config.overlayTint': '#0147af',
      'config.overlayOpacity': 0.75,
      'config.focalPoint': 'center',
      'config.priceCap': 999,
      'config.maxProducts': 8,
      'config.sortBy': 'price_asc',
      'config.productSource': 'price_filter',
    };

    const res = await HomepageSection.updateOne(
      { sectionType: 'affordable_store' },
      { $set: updateData },
      { upsert: true }
    );

    console.log('Update result:', res);

    const doc = await HomepageSection.findOne({ sectionType: 'affordable_store' });
    console.log('Updated document:');
    console.log(JSON.stringify({
      eyebrow: doc.eyebrow,
      title: doc.title,
      subtitle: doc.subtitle,
      config: doc.config,
    }, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateSection();
