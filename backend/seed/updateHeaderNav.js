import mongoose from 'mongoose';

async function updateHeaderNav() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce');
  const db = mongoose.connection.db;

  await db.collection('navigationmenus').updateOne(
    { menuKey: 'header' },
    {
      $set: {
        title: 'Primary Storefront Navigation',
        isActive: true,
        items: [
          { label: 'Men', url: '/men', isExternal: false, displayOrder: 0, children: [] },
          { label: 'Women', url: '/women', isExternal: false, displayOrder: 1, children: [] },
          { label: 'Kids', url: '/kids', isExternal: false, displayOrder: 2, children: [] },
          { label: 'Our Story', url: '/about', isExternal: false, displayOrder: 3, children: [] },
          { label: 'Contact', url: '/contact', isExternal: false, displayOrder: 4, children: [] },
        ],
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log('Successfully updated header navigation in MongoDB!');
  await mongoose.disconnect();
}

updateHeaderNav().catch((err) => {
  console.error('Failed to update header nav:', err);
  process.exit(1);
});
