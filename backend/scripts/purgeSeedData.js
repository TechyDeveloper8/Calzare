import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Order } from '../models/Order.js';
import { SupportInquiry } from '../models/SupportInquiry.js';
import { Review } from '../models/Review.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { AuditLog } from '../models/AuditLog.js';
import { Category } from '../models/Category.js';
import { Collection } from '../models/Collection.js';
import { HomepageSection } from '../models/HomepageSection.js';
import { StoreSetting } from '../models/StoreSetting.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/calzare_ecommerce';

const purgeSeedData = async () => {
  const includeCategories = process.argv.includes('--include-categories');

  console.log('====================================================');
  console.log('   CALZARE Production Seed & Test Data Purge Tool   ');
  console.log('====================================================');
  console.log(`Connecting to: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Connected] MongoDB connection established successfully.\n');

    const results = {};

    // 1. Purge Products
    const prodRes = await Product.deleteMany({});
    results['Products'] = prodRes.deletedCount;

    // 2. Purge Product Variants
    const varRes = await ProductVariant.deleteMany({});
    results['Product Variants'] = varRes.deletedCount;

    // 3. Purge Test Orders
    const ordRes = await Order.deleteMany({});
    results['Orders (Test)'] = ordRes.deletedCount;

    // 4. Purge Test Support Inquiries
    const inqRes = await SupportInquiry.deleteMany({});
    results['Support Inquiries (Test)'] = inqRes.deletedCount;

    // 5. Purge Seed Reviews
    const revRes = await Review.deleteMany({});
    results['Reviews (Seed)'] = revRes.deletedCount;

    // 6. Purge Inventory Movements
    const invRes = await InventoryMovement.deleteMany({});
    results['Inventory Movements'] = invRes.deletedCount;

    // 7. Purge Carts
    const cartRes = await Cart.deleteMany({});
    results['Carts'] = cartRes.deletedCount;

    // 8. Purge Wishlists
    const wishRes = await Wishlist.deleteMany({});
    results['Wishlists'] = wishRes.deletedCount;

    // 9. Purge Dummy Customers (keep superadmin / admin accounts safe)
    const userRes = await User.deleteMany({ role: { $ne: 'superadmin' } });
    results['Customers (Dummy/Test)'] = userRes.deletedCount;

    // 10. Purge Test Coupons
    const coupRes = await Coupon.deleteMany({});
    results['Coupons (Test)'] = coupRes.deletedCount;

    // 11. Purge Test Audit Logs
    const auditRes = await AuditLog.deleteMany({});
    results['Audit Logs (Test)'] = auditRes.deletedCount;

    // 12. Optional: Categories purge if explicitly requested
    if (includeCategories) {
      const catRes = await Category.deleteMany({});
      results['Categories'] = catRes.deletedCount;
    }

    // 13. Clean references in Collections
    const colUpdate = await Collection.updateMany(
      {},
      { $set: { manualProductIds: [] } }
    );

    // 14. Clean references in Homepage Sections
    const hpSections = await HomepageSection.find({});
    for (const sec of hpSections) {
      let changed = false;
      if (sec.config && Array.isArray(sec.config.selectedProductIds) && sec.config.selectedProductIds.length > 0) {
        sec.config.selectedProductIds = [];
        sec.markModified('config');
        changed = true;
      }
      // Fix residual "Sola" copy in shop_audience panels if present
      if (sec.sectionKey === 'shop_audience' && sec.config) {
        const panels = sec.config.categoryPanels || sec.config.audienceCards || [];
        for (const p of panels) {
          if (p.text && p.text.includes('Sola')) {
            p.text = p.text.replace(/Sola/g, 'CALZARE');
            changed = true;
          }
          if (p.tagline && p.tagline.includes('Sola')) {
            p.tagline = p.tagline.replace(/Sola/g, 'CALZARE');
            changed = true;
          }
        }
        if (changed) {
          sec.markModified('config');
        }
      }
      if (changed) {
        await sec.save();
      }
    }

    // 15. Clean references in Store Settings
    await StoreSetting.updateMany(
      {},
      {
        $set: {
          'brandComparisonDefault.selectedProductIds': [],
        },
      }
    );

    console.log('Purge Summary:');
    console.log('----------------------------------------------------');
    for (const [key, count] of Object.entries(results)) {
      console.log(`  ✓ ${key.padEnd(28)}: ${count} removed`);
    }
    console.log('----------------------------------------------------');

    // Admin account confirmation
    const remainingAdmins = await User.find({ role: 'superadmin' }).select('name email role');
    console.log('\nPreserved Admin Account(s):');
    remainingAdmins.forEach((adm) => {
      console.log(`  • ${adm.name} (${adm.email}) [${adm.role}]`);
    });

    console.log('\n[SUCCESS] Store is now completely clean and ready for real-time production use!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Failed to purge seed data:', error.message);
    process.exit(1);
  }
};

purgeSeedData();

