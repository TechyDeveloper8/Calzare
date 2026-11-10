import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { formatMongoUri } from '../config/db.js';

dotenv.config();

const email = (process.argv[2] || process.env.ADMIN_EMAIL || 'admin@calzare.com').trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin@123456';
const name = process.argv[4] || 'CALZARE Super Admin';

async function createOrUpdateAdmin() {
  const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';
  const mongoUri = formatMongoUri(rawUri);

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Connected] ${mongoose.connection.host}/${mongoose.connection.name}`);

  const hashedPassword = await bcrypt.hash(password, 12);
  let admin = await User.findOne({ email });

  if (admin) {
    admin.password = hashedPassword;
    admin.role = 'superadmin';
    await admin.save();
    console.log(`\n✓ Existing Admin password successfully updated: ${email}`);
  } else {
    admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
      phone: '+91 99887 76655',
    });
    console.log(`\n✓ New Super Admin account successfully created: ${email}`);
  }

  console.log('\n--- Admin Login Credentials ---');
  console.log(`  Portal URL : /admin/login`);
  console.log(`  Email      : ${email}`);
  console.log(`  Password   : ${password}`);
  console.log(`  Role       : superadmin`);
  console.log('-------------------------------\n');

  await mongoose.disconnect();
  process.exit(0);
}

createOrUpdateAdmin().catch((err) => {
  console.error('\n[Error] Failed to create or update admin:', err.message);
  process.exit(1);
});
