import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { formatMongoUri } from '../config/db.js';
import { ensureDefaultHomepageSections } from '../controllers/homepageController.js';

dotenv.config();

async function init() {
  const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_production';
  const mongoUri = formatMongoUri(rawUri);

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[Connected] ${mongoose.connection.host}/${mongoose.connection.name}`);

  console.log('Checking & initializing default storefront homepage sections...');
  const sections = await ensureDefaultHomepageSections();
  console.log(`\n✓ Active Homepage Sections (${sections.length}):`);
  sections.forEach((s) => {
    console.log(`  [${s.displayOrder}] ${s.sectionKey} (${s.sectionType}) — "${s.title.replace(/\n/g, ' ')}"`);
  });

  await mongoose.disconnect();
  console.log('\nAll 10 Homepage CMS Sections are ready on the database.');
  process.exit(0);
}

init().catch((err) => {
  console.error('\n[Error] Failed to initialize homepage sections:', err.message);
  process.exit(1);
});
