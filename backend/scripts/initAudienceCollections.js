import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { formatMongoUri } from '../config/db.js';
import { ensureCoreAudienceCollections } from '../controllers/catalogController.js';
import { ensureDefaultHomepageSections } from '../controllers/homepageController.js';

dotenv.config();

async function init() {
  const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_production';
  const mongoUri = formatMongoUri(rawUri);

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[Connected] ${mongoose.connection.host}/${mongoose.connection.name}`);

  console.log('Checking & initializing core audience collections...');
  const collections = await ensureCoreAudienceCollections();
  console.log(`\n✓ Active Collections (${collections.length}):`);
  collections.forEach((c) => {
    console.log(`  • ${c.name} (/${c.slug}) — Hero: "${c.hero?.heading || 'Default'}"`);
  });

  console.log('\nChecking & initializing default homepage CMS sections...');
  const sections = await ensureDefaultHomepageSections();
  console.log(`✓ Active Homepage Sections (${sections.length}):`);
  sections.forEach((s) => {
    console.log(`  [${s.displayOrder}] ${s.sectionKey} (${s.sectionType})`);
  });

  await mongoose.disconnect();
  console.log('\nAll 4 Core Collections and 10 Homepage CMS Sections are ready on the database.');
  process.exit(0);
}

init().catch((err) => {
  console.error('\n[Error] Failed to initialize defaults:', err.message);
  process.exit(1);
});
