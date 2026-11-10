import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { formatMongoUri } from '../config/db.js';
import { ensureCoreAudienceCollections } from '../controllers/catalogController.js';

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

  await mongoose.disconnect();
  console.log('\nAll 4 Core Audience Hero Banners are ready on the database.');
  process.exit(0);
}

init().catch((err) => {
  console.error('\n[Error] Failed to initialize collections:', err.message);
  process.exit(1);
});

