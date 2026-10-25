import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

const panels = [
  {
    id: 'panel_women',
    title: 'Women',
    text: 'No laces, no rush — comfort that clocks off exactly when you do.',
    tagline: 'No laces, no rush — comfort that clocks off exactly when you do.',
    ctaLabel: 'Shop Women',
    link: '/collections/women',
    imageUrl: '/images/split/women-collection-image.jpg',
    mobileImageUrl: '',
    altText: 'Shop Women',
    objectPosition: 'center bottom',
    textAlign: 'left',
    contrastMode: 'shadow_gradient',
    isEnabled: true,
    isPublished: true,
    order: 0,
  },
  {
    id: 'panel_men',
    title: 'Men',
    text: 'Stairs, streets, wherever next.\nSola moves at your pace.',
    tagline: 'Stairs, streets, wherever next.\nSola moves at your pace.',
    ctaLabel: 'Shop Men',
    link: '/collections/men',
    imageUrl: '/images/split/men-collection-image.jpg',
    mobileImageUrl: '',
    altText: 'Shop Men',
    objectPosition: 'center bottom',
    textAlign: 'left',
    contrastMode: 'shadow_gradient',
    isEnabled: true,
    isPublished: true,
    order: 1,
  },
  {
    id: 'panel_kids',
    title: 'Kids',
    text: 'Little steps. Big personality. Comfort made for every adventure.',
    tagline: 'Little steps. Big personality. Comfort made for every adventure.',
    ctaLabel: 'Shop Kids',
    link: '/collections/kids',
    imageUrl: '/images/split/kids-collection-image.jpg',
    mobileImageUrl: '',
    altText: 'Shop Kids',
    objectPosition: 'center bottom',
    textAlign: 'left',
    contrastMode: 'shadow_gradient',
    isEnabled: true,
    isPublished: true,
    order: 2,
  },
  {
    id: 'panel_unisex',
    title: 'Unisex',
    text: 'No labels. No limits. Just comfort that moves with you.',
    tagline: 'No labels. No limits. Just comfort that moves with you.',
    ctaLabel: 'Shop Unisex',
    link: '/collections/unisex',
    imageUrl: '/images/split/unisex-collection-image.jpg',
    mobileImageUrl: '',
    altText: 'Shop Unisex',
    objectPosition: 'center bottom',
    textAlign: 'left',
    contrastMode: 'shadow_gradient',
    isEnabled: true,
    isPublished: true,
    order: 3,
  },
];

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB at', MONGO_URI);

  const collection = mongoose.connection.collection('homepagesections');

  // Find existing audience section or create one
  const existing = await collection.findOne({ sectionKey: 'shop_audience' });

  if (existing) {
    await collection.updateOne(
      { sectionKey: 'shop_audience' },
      {
        $set: {
          'config.categoryPanels': panels,
          'config.audienceCards': panels,
          'config.layoutVariant': 'paired_rows',
          updatedAt: new Date(),
        },
      }
    );
    console.log('Updated existing shop_audience section with 4-category split panels.');
  } else {
    await collection.insertOne({
      sectionKey: 'shop_audience',
      sectionType: 'audience_cards',
      title: 'Shop by Category',
      subtitle: '',
      eyebrow: '',
      displayOrder: 3,
      isEnabled: true,
      config: {
        layoutVariant: 'paired_rows',
        categoryPanels: panels,
        audienceCards: panels,
      },
      publishedVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Inserted new shop_audience section with 4-category split panels.');
  }

  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
