import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

async function cleanProductEyebrows() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateMany(
      {},
      { $set: { 'customCopy.eyebrow': '' } }
    );
    console.log('Product eyebrow cleanup result:', result);

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning product eyebrows:', err);
    process.exit(1);
  }
}

cleanProductEyebrows();
