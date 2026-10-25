import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { HomepageSection } from '../models/HomepageSection.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

async function removeSupertitle() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const updateRes = await HomepageSection.updateMany({}, { $set: { eyebrow: '' } });
    console.log('Updated homepage sections to remove supertitles:', updateRes);

    const sections = await HomepageSection.find({}, 'sectionType sectionKey title eyebrow');
    console.log('Current section eyebrows:');
    sections.forEach((s) => {
      console.log(`- ${s.sectionType} (${s.sectionKey}): eyebrow="${s.eyebrow}"`);
    });

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

removeSupertitle();
