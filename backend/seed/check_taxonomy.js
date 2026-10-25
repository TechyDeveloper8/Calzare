import mongoose from 'mongoose';

async function checkTaxonomy() {
  await mongoose.connect('mongodb://127.0.0.1:27017/calzare_ecommerce');
  const collections = await mongoose.connection.collection('collections').find().toArray();
  console.log('Collections in DB:', collections.length);
  collections.forEach(c => console.log(`- ${c.name} (slug: /collections/${c.slug})`));

  const categories = await mongoose.connection.collection('categories').find().toArray();
  console.log('\nCategories in DB:', categories.length);
  categories.forEach(c => console.log(`- ${c.name} (slug: ${c.slug})`));

  process.exit(0);
}

checkTaxonomy();
