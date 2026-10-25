import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { HomepageSection } from '../models/HomepageSection.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { CMSPage } from '../models/CMSPage.js';
import { NavigationMenu } from '../models/NavigationMenu.js';
import { StoreSetting } from '../models/StoreSetting.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data for clean baseline
    await User.deleteMany();
    await Category.deleteMany();
    await Collection.deleteMany();
    await Product.deleteMany();
    await ProductVariant.deleteMany();
    await HomepageSection.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await CMSPage.deleteMany();
    await NavigationMenu.deleteMany();
    await StoreSetting.deleteMany();

    console.log('[Seed] Existing collections cleared');

    // 1. Users
    const adminUser = await User.create({
      name: 'CALZARE Super Admin',
      email: 'admin@calzare.com',
      password: 'Admin@123456',
      role: 'superadmin',
      phone: '+91 99887 76655',
    });

    const customerUser = await User.create({
      name: 'Anurag Raj',
      email: 'anurag@calzare.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '+91 98765 43210',
      addresses: [
        {
          label: 'Studio',
          fullName: 'Anurag Raj',
          phone: '+91 98765 43210',
          street: '12th Main Road, HAL 2nd Stage, Indiranagar',
          landmark: 'Near Metro Station',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    console.log('[Seed] Admin and customer accounts created');

    // 2. Categories
    const catClogs = await Category.create({
      name: 'Clogs',
      slug: 'clogs',
      description: 'Ultra-cushioned, dual-density waterproof foam clogs engineered for all-day urban and leisure wear.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
      isActive: true,
    });

    const catSliders = await Category.create({
      name: 'Sliders',
      slug: 'sliders',
      description: 'Minimalist slip-on slides with sculpted footbeds and high-energy rebound foam.',
      image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
      isActive: true,
    });

    const catSandals = await Category.create({
      name: 'Sandals',
      slug: 'sandals',
      description: 'Adventure-ready outdoor sandals with adjustable quick-lock straps and rugged grip lugs.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
      isActive: true,
    });

    const catWalkers = await Category.create({
      name: 'Foam Walkers',
      slug: 'foam-walkers',
      description: 'Next-gen street mules and slip-ons with sculpted aerodynamic architecture.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
      isActive: true,
    });

    // 3. Collections
    const col999 = await Collection.create({
      name: 'Under ₹999 Store',
      slug: 'under-999-store',
      description: 'Affordable luxury. Premium waterproof comfort starting at honest everyday prices.',
      heroMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1600&q=80',
        alt: 'Under 999 Store Collection',
      },
      displayOrder: 1,
      isPublished: true,
      isFeaturedOnHome: true,
      ruleType: 'price_under',
      ruleValue: '999',
    });

    const colCloud = await Collection.create({
      name: 'Cloud Foam Series',
      slug: 'cloud-foam-series',
      description: 'Zero gravity on pavement. Crafted from closed-cell injection molded EVA.',
      heroMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cloud Foam Series',
      },
      displayOrder: 2,
      isPublished: true,
      isFeaturedOnHome: true,
      ruleType: 'manual',
    });

    const colHeritage = await Collection.create({
      name: 'Art & Heritage Prints',
      slug: 'art-and-heritage',
      description: 'Bold expressive colorways honoring global craft, botanical prints, and geometric storytelling.',
      heroMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80',
        alt: 'Art and Heritage',
      },
      displayOrder: 3,
      isPublished: true,
      isFeaturedOnHome: true,
      ruleType: 'manual',
    });

    // 4. Products with Multi-Color Variants and Size Stock Matrix
    // Product 1: CALZARE Apex Cloud Clogs
    const p1 = await Product.create({
      name: 'Apex Cloud Hydro Clog',
      slug: 'apex-cloud-hydro-clog',
      sku: 'CALZ-CLG-APEX',
      brand: 'CALZARE',
      shortDescription: 'Dual-density architectural foam clog with targeted arch ventilation and pillow soft rebound.',
      description:
        'Engineered for 16-hour daily wear. The Apex Cloud Hydro Clog marries runway aesthetics with high-grade closed-cell EVA foam. 100% waterproof, odor resistant, and fitted with our proprietary CloudFootbed contour that actively cushions heel strikes.',
      features: [
        'Proprietary Dual-Density Closed Cell EVA Foam',
        'Waterproof & Floatable in Water',
        'Ergonomic High-Arch Spine Support',
        'Rear Heel Strap with 360-degree Pivot Action',
        'Anti-Slip Hexagonal Sole Traction',
      ],
      material: 'Closed-Cell Expanded EVA Polymer',
      soleMaterial: 'Lugged Slip-Resistant EVA Outsole',
      closureType: 'Convertible Swivel Heel Strap',
      weightGrams: 280,
      category: catClogs._id,
      collections: [colCloud._id, col999._id],
      tags: ['clog', 'waterproof', 'cloud', 'bestseller', 'monsoon'],
      productType: 'Clogs',
      audience: 'Unisex',
      baseRegularPrice: 1499,
      baseSalePrice: 899,
      status: 'published',
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      salesCount: 142,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
          alt: 'Apex Cloud Clog Oat Beige View 1',
          isMain: true,
          order: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=85',
          alt: 'Apex Cloud Clog Oat Beige View 2',
          isMain: false,
          order: 1,
        },
      ],
      seoTitle: 'Apex Cloud Hydro Clog | CALZARE Waterproof Footwear',
      seoDescription: 'Shop the Apex Cloud Hydro Clog. Pillow-soft arch support, 100% waterproof closed-cell foam in Oat, Pitch Black, and Sage.',
    });

    // Variants for Product 1
    await ProductVariant.create([
      {
        productId: p1._id,
        colorName: 'Oat Beige',
        colorHex: '#D9CFBE',
        variantSku: 'CALZ-CLG-APEX-OAT',
        regularPrice: 1499,
        salePrice: 899,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
            alt: 'Oat Beige Apex Clog Main',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=85',
            alt: 'Oat Beige Apex Clog Detail',
            isMain: false,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 14, sku: 'CALZ-CLG-APEX-OAT-06' },
          { size: 'UK 7', stock: 22, sku: 'CALZ-CLG-APEX-OAT-07' },
          { size: 'UK 8', stock: 18, sku: 'CALZ-CLG-APEX-OAT-08' },
          { size: 'UK 9', stock: 15, sku: 'CALZ-CLG-APEX-OAT-09' },
          { size: 'UK 10', stock: 9, sku: 'CALZ-CLG-APEX-OAT-10' },
        ],
      },
      {
        productId: p1._id,
        colorName: 'Pitch Black',
        colorHex: '#18181A',
        variantSku: 'CALZ-CLG-APEX-BLK',
        regularPrice: 1499,
        salePrice: 899,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=85',
            alt: 'Pitch Black Apex Clog Main',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85',
            alt: 'Pitch Black Apex Clog Top',
            isMain: false,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 10, sku: 'CALZ-CLG-APEX-BLK-06' },
          { size: 'UK 7', stock: 16, sku: 'CALZ-CLG-APEX-BLK-07' },
          { size: 'UK 8', stock: 25, sku: 'CALZ-CLG-APEX-BLK-08' },
          { size: 'UK 9', stock: 12, sku: 'CALZ-CLG-APEX-BLK-09' },
          { size: 'UK 10', stock: 6, sku: 'CALZ-CLG-APEX-BLK-10' },
        ],
      },
      {
        productId: p1._id,
        colorName: 'Sage Moss',
        colorHex: '#849271',
        variantSku: 'CALZ-CLG-APEX-SGE',
        regularPrice: 1599,
        salePrice: 949,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=1000&q=85',
            alt: 'Sage Moss Apex Clog',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 8, sku: 'CALZ-CLG-APEX-SGE-06' },
          { size: 'UK 7', stock: 14, sku: 'CALZ-CLG-APEX-SGE-07' },
          { size: 'UK 8', stock: 12, sku: 'CALZ-CLG-APEX-SGE-08' },
          { size: 'UK 9', stock: 9, sku: 'CALZ-CLG-APEX-SGE-09' },
          { size: 'UK 10', stock: 4, sku: 'CALZ-CLG-APEX-SGE-10' },
        ],
      },
      {
        productId: p1._id,
        colorName: 'Chalk White',
        colorHex: '#F4F3EF',
        variantSku: 'CALZ-CLG-APEX-WHT',
        regularPrice: 1499,
        salePrice: 899,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=85',
            alt: 'Chalk White Apex Clog',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 12, sku: 'CALZ-CLG-APEX-WHT-06' },
          { size: 'UK 7', stock: 18, sku: 'CALZ-CLG-APEX-WHT-07' },
          { size: 'UK 8', stock: 20, sku: 'CALZ-CLG-APEX-WHT-08' },
          { size: 'UK 9', stock: 10, sku: 'CALZ-CLG-APEX-WHT-09' },
          { size: 'UK 10', stock: 5, sku: 'CALZ-CLG-APEX-WHT-10' },
        ],
      },
    ]);

    // Product 2: CALZARE Aeroflex Ergonomic Slider
    const p2 = await Product.create({
      name: 'Aeroflex Ergonomic Slider',
      slug: 'aeroflex-ergonomic-slider',
      sku: 'CALZ-SLD-AERO',
      brand: 'CALZARE',
      shortDescription: 'Monolithic curve slider with 35mm thick heel cushioning and wide instep wrap.',
      description:
        'Designed for post-workout recovery, urban lounging, and beach days. The Aeroflex Slider is sculpted from high-resilience foam that molds to your unique foot imprint over time.',
      features: [
        '35mm Thick Shock-Absorbing Sole Bed',
        'Contoured Toe Grip Ridge for Secure Stride',
        'Wide Wrap Band Eliminates Friction Blisters',
        'Water-Repellent Non-Porous Surface',
      ],
      material: 'Molded EVA Foam',
      soleMaterial: 'Textured EVA Outsole',
      closureType: 'Slip-On Slider',
      weightGrams: 210,
      category: catSliders._id,
      collections: [colCloud._id, col999._id],
      tags: ['slider', 'slides', 'summer', 'recovery', 'poolside'],
      productType: 'Sliders',
      audience: 'Unisex',
      baseRegularPrice: 1199,
      baseSalePrice: 699,
      status: 'published',
      isFeatured: true,
      isBestseller: true,
      salesCount: 98,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=85',
          alt: 'Aeroflex Slider Main',
          isMain: true,
        },
      ],
      seoTitle: 'Aeroflex Ergonomic Slider | CALZARE Recovery Slides',
      seoDescription: 'Ultra-cushioned Aeroflex Ergonomic Sliders. 35mm thick foam bed in Desert Clay, Carbon Shadow, and Electric Lime.',
    });

    await ProductVariant.create([
      {
        productId: p2._id,
        colorName: 'Desert Clay',
        colorHex: '#C77D58',
        variantSku: 'CALZ-SLD-AERO-CLY',
        regularPrice: 1199,
        salePrice: 699,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=85',
            alt: 'Desert Clay Aeroflex Slide',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 15, sku: 'CALZ-SLD-AERO-CLY-06' },
          { size: 'UK 7', stock: 20, sku: 'CALZ-SLD-AERO-CLY-07' },
          { size: 'UK 8', stock: 18, sku: 'CALZ-SLD-AERO-CLY-08' },
          { size: 'UK 9', stock: 14, sku: 'CALZ-SLD-AERO-CLY-09' },
          { size: 'UK 10', stock: 8, sku: 'CALZ-SLD-AERO-CLY-10' },
        ],
      },
      {
        productId: p2._id,
        colorName: 'Carbon Shadow',
        colorHex: '#232428',
        variantSku: 'CALZ-SLD-AERO-SHD',
        regularPrice: 1199,
        salePrice: 699,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
            alt: 'Carbon Shadow Aeroflex Slide',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 12, sku: 'CALZ-SLD-AERO-SHD-06' },
          { size: 'UK 7', stock: 19, sku: 'CALZ-SLD-AERO-SHD-07' },
          { size: 'UK 8', stock: 24, sku: 'CALZ-SLD-AERO-SHD-08' },
          { size: 'UK 9', stock: 16, sku: 'CALZ-SLD-AERO-SHD-09' },
          { size: 'UK 10', stock: 11, sku: 'CALZ-SLD-AERO-SHD-10' },
        ],
      },
      {
        productId: p2._id,
        colorName: 'Electric Lime',
        colorHex: '#C4F135',
        variantSku: 'CALZ-SLD-AERO-LME',
        regularPrice: 1299,
        salePrice: 799,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
            alt: 'Electric Lime Aeroflex Slide',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 9, sku: 'CALZ-SLD-AERO-LME-06' },
          { size: 'UK 7', stock: 15, sku: 'CALZ-SLD-AERO-LME-07' },
          { size: 'UK 8', stock: 14, sku: 'CALZ-SLD-AERO-LME-08' },
          { size: 'UK 9', stock: 11, sku: 'CALZ-SLD-AERO-LME-09' },
          { size: 'UK 10', stock: 5, sku: 'CALZ-SLD-AERO-LME-10' },
        ],
      },
    ]);

    // Product 3: CALZARE HydroGrip Trail Sandal
    const p3 = await Product.create({
      name: 'HydroGrip All-Terrain Sandal',
      slug: 'hydrogrip-all-terrain-sandal',
      sku: 'CALZ-SND-HYDRO',
      brand: 'CALZARE',
      shortDescription: 'Reinforced neoprene strap sandal with dual buckle lock and high-friction wet pavement outsole.',
      description:
        'Built for monsoon streets, gravel trails, and coastal exploration. The HydroGrip combines quick-drying recycled webbing straps with our dual-density cushioned chassis. Never slips, even on drenched riverstones.',
      features: [
        'Quick-Drying Hydrophobic Webbing Straps',
        'Anodized Aluminum Cam-Lock Buckles',
        'Vibram-Inspired Multi-Directional Lug Outsole',
        'Anatomical Arch Cradle Reduces Calf Fatigue',
      ],
      material: 'Recycled Poly Webbing + Closed-Cell Cushion Footbed',
      soleMaterial: 'Traction Lugged Synthetic Rubber Sole',
      closureType: 'Tri-Point Velcro & Cam-Lock',
      weightGrams: 340,
      category: catSandals._id,
      collections: [colCloud._id],
      tags: ['sandal', 'outdoor', 'trail', 'adventure', 'rugged'],
      productType: 'Sandals',
      audience: 'Men',
      baseRegularPrice: 1999,
      baseSalePrice: 1299,
      status: 'published',
      isFeatured: true,
      salesCount: 64,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=85',
          alt: 'HydroGrip Sandal Main',
          isMain: true,
        },
      ],
      seoTitle: 'HydroGrip All-Terrain Sandal | CALZARE Outdoor',
      seoDescription: 'Conquer wet pavements and rocky trails with CALZARE HydroGrip All-Terrain Sandals.',
    });

    await ProductVariant.create([
      {
        productId: p3._id,
        colorName: 'Espresso Tan',
        colorHex: '#4A3728',
        variantSku: 'CALZ-SND-HYDRO-ESP',
        regularPrice: 1999,
        salePrice: 1299,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=85',
            alt: 'Espresso Tan HydroGrip',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 7', stock: 12, sku: 'CALZ-SND-HYDRO-ESP-07' },
          { size: 'UK 8', stock: 16, sku: 'CALZ-SND-HYDRO-ESP-08' },
          { size: 'UK 9', stock: 14, sku: 'CALZ-SND-HYDRO-ESP-09' },
          { size: 'UK 10', stock: 8, sku: 'CALZ-SND-HYDRO-ESP-10' },
        ],
      },
      {
        productId: p3._id,
        colorName: 'Stealth Black',
        colorHex: '#121316',
        variantSku: 'CALZ-SND-HYDRO-BLK',
        regularPrice: 1999,
        salePrice: 1299,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
            alt: 'Stealth Black HydroGrip',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 7', stock: 14, sku: 'CALZ-SND-HYDRO-BLK-07' },
          { size: 'UK 8', stock: 19, sku: 'CALZ-SND-HYDRO-BLK-08' },
          { size: 'UK 9', stock: 15, sku: 'CALZ-SND-HYDRO-BLK-09' },
          { size: 'UK 10', stock: 7, sku: 'CALZ-SND-HYDRO-BLK-10' },
        ],
      },
    ]);

    // Product 4: CALZARE NeoFoam Bold Statement Mules
    const p4 = await Product.create({
      name: 'NeoFoam Sculpted Mule',
      slug: 'neofoam-sculpted-mule',
      sku: 'CALZ-WLR-NEO',
      brand: 'CALZARE',
      shortDescription: 'Futuristic chunky foam silhouette with beveled heel geometry and air-flow side tunnels.',
      description:
        'A statement piece designed at the intersection of streetwear and avant-garde footwear. Sculpted in one seamless piece of bio-based EVA with generous volume, aggressive proportions, and a weightless feel.',
      features: [
        'Avant-Garde Architectural Silhouette',
        'Beveled Heel Strike Geometry',
        'Side Air Channelling for Breathability',
        'Sculpted High-Rise Front Vamp',
      ],
      material: 'Closed-Cell Eco-EVA',
      soleMaterial: 'Sculpted Monolith Sole',
      closureType: 'Slip-On Mule',
      weightGrams: 310,
      category: catWalkers._id,
      collections: [colCloud._id, col999._id],
      tags: ['mule', 'chunky', 'streetwear', 'fashion', 'statement'],
      productType: 'Foam Walkers',
      audience: 'Women',
      baseRegularPrice: 1799,
      baseSalePrice: 999,
      status: 'published',
      isFeatured: true,
      salesCount: 82,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=85',
          alt: 'NeoFoam Mule Main',
          isMain: true,
        },
      ],
      seoTitle: 'NeoFoam Sculpted Mule | CALZARE High Fashion Foam',
      seoDescription: 'Futuristic chunky foam mules with bold geometry and all-day cloud comfort.',
    });

    await ProductVariant.create([
      {
        productId: p4._id,
        colorName: 'Tangerine Solar',
        colorHex: '#FF6332',
        variantSku: 'CALZ-WLR-NEO-TNG',
        regularPrice: 1799,
        salePrice: 999,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=85',
            alt: 'Tangerine Solar NeoFoam',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 5', stock: 10, sku: 'CALZ-WLR-NEO-TNG-05' },
          { size: 'UK 6', stock: 18, sku: 'CALZ-WLR-NEO-TNG-06' },
          { size: 'UK 7', stock: 22, sku: 'CALZ-WLR-NEO-TNG-07' },
          { size: 'UK 8', stock: 14, sku: 'CALZ-WLR-NEO-TNG-08' },
        ],
      },
      {
        productId: p4._id,
        colorName: 'Slate Grey',
        colorHex: '#62666E',
        variantSku: 'CALZ-WLR-NEO-SLT',
        regularPrice: 1799,
        salePrice: 999,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85',
            alt: 'Slate Grey NeoFoam',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 5', stock: 8, sku: 'CALZ-WLR-NEO-SLT-05' },
          { size: 'UK 6', stock: 16, sku: 'CALZ-WLR-NEO-SLT-06' },
          { size: 'UK 7', stock: 20, sku: 'CALZ-WLR-NEO-SLT-07' },
          { size: 'UK 8', stock: 11, sku: 'CALZ-WLR-NEO-SLT-08' },
        ],
      },
    ]);

    // Product 5: CALZARE Artisan Wave Heritage Clogs
    const p5 = await Product.create({
      name: 'Artisan Wave Heritage Clog',
      slug: 'artisan-wave-heritage-clog',
      sku: 'CALZ-CLG-ART',
      brand: 'CALZARE',
      shortDescription: 'Limited edition high-density clog featuring laser-etched geometric wave art across the upper.',
      description:
        'A wearable gallery piece. The Artisan Wave series showcases intricate textural topography inspired by ancient coastal topography, rendered with micron-precision hot-embossing that never fades or peels.',
      features: [
        'Laser-Etched Topographic Surface Relief',
        'High-Density Dual Core EVA Formulation',
        'Metallic Anodized Heel Pivot Hardware',
        'Limited Edition Collector Box Packaging',
      ],
      material: 'Laser-Embossed Closed-Cell EVA',
      soleMaterial: 'Anti-Slip Deep Lug Sole',
      closureType: 'Swivel Heel Lock',
      weightGrams: 300,
      category: catClogs._id,
      collections: [colHeritage._id],
      tags: ['heritage', 'artisan', 'limited', 'wave', 'collector'],
      productType: 'Clogs',
      audience: 'Unisex',
      baseRegularPrice: 2199,
      baseSalePrice: 1499,
      status: 'published',
      isFeatured: true,
      salesCount: 51,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
          alt: 'Artisan Wave Clog Main',
          isMain: true,
        },
      ],
      seoTitle: 'Artisan Wave Heritage Clog | CALZARE Limited Edition',
      seoDescription: 'Limited edition laser-embossed Artisan Wave Heritage Clogs. Wearable art for your everyday walk.',
    });

    await ProductVariant.create([
      {
        productId: p5._id,
        colorName: 'Indigo Shibori',
        colorHex: '#2C3E6B',
        variantSku: 'CALZ-CLG-ART-IND',
        regularPrice: 2199,
        salePrice: 1499,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
            alt: 'Indigo Shibori Artisan Clog',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 7, sku: 'CALZ-CLG-ART-IND-06' },
          { size: 'UK 7', stock: 12, sku: 'CALZ-CLG-ART-IND-07' },
          { size: 'UK 8', stock: 14, sku: 'CALZ-CLG-ART-IND-08' },
          { size: 'UK 9', stock: 8, sku: 'CALZ-CLG-ART-IND-09' },
          { size: 'UK 10', stock: 4, sku: 'CALZ-CLG-ART-IND-10' },
        ],
      },
      {
        productId: p5._id,
        colorName: 'Terracotta Folk',
        colorHex: '#A75D43',
        variantSku: 'CALZ-CLG-ART-TER',
        regularPrice: 2199,
        salePrice: 1499,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=85',
            alt: 'Terracotta Folk Artisan Clog',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 6, sku: 'CALZ-CLG-ART-TER-06' },
          { size: 'UK 7', stock: 11, sku: 'CALZ-CLG-ART-TER-07' },
          { size: 'UK 8', stock: 15, sku: 'CALZ-CLG-ART-TER-08' },
          { size: 'UK 9', stock: 9, sku: 'CALZ-CLG-ART-TER-09' },
          { size: 'UK 10', stock: 3, sku: 'CALZ-CLG-ART-TER-10' },
        ],
      },
    ]);

    // Product 6: CALZARE Drift Pure Walkers
    const p6 = await Product.create({
      name: 'Drift Pure Cloud Walker',
      slug: 'drift-pure-cloud-walker',
      sku: 'CALZ-WLR-DRIFT',
      brand: 'CALZARE',
      shortDescription: 'Everyday slip-on street walkers with recessed arch cradle and featherlight buoyancy.',
      description:
        'We stripped away unnecessary panels and weight to engineer the purest walk possible. Featherlight at just 240 grams, the Drift Pure feels like stepping on fresh powder snow while delivering firm pavement traction.',
      features: [
        'Ultra-Lightweight 240g Construction',
        'Deep Contoured Heel Cup for Stability',
        'Smooth Minimalist Monotone Finish',
        'Zero-Odor Antibacterial Additives',
      ],
      material: 'Seamless Injection EVA',
      soleMaterial: 'Micro-Grooved EVA Outsole',
      closureType: 'Slip-On',
      weightGrams: 240,
      category: catWalkers._id,
      collections: [colCloud._id, col999._id],
      tags: ['walker', 'slipon', 'comfort', 'everyday', 'minimal'],
      productType: 'Foam Walkers',
      audience: 'Unisex',
      baseRegularPrice: 1399,
      baseSalePrice: 849,
      status: 'published',
      isFeatured: true,
      salesCount: 77,
      defaultImages: [
        {
          url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
          alt: 'Drift Pure Walker Main',
          isMain: true,
        },
      ],
      seoTitle: 'Drift Pure Cloud Walker | CALZARE Everyday Comfort',
      seoDescription: 'Featherlight 240g Drift Pure Cloud Walkers in Concrete Frost and Midnight Obsidian.',
    });

    await ProductVariant.create([
      {
        productId: p6._id,
        colorName: 'Concrete Frost',
        colorHex: '#B8BDC4',
        variantSku: 'CALZ-WLR-DRIFT-FST',
        regularPrice: 1399,
        salePrice: 849,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
            alt: 'Concrete Frost Drift Walker',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 12, sku: 'CALZ-WLR-DRIFT-FST-06' },
          { size: 'UK 7', stock: 18, sku: 'CALZ-WLR-DRIFT-FST-07' },
          { size: 'UK 8', stock: 20, sku: 'CALZ-WLR-DRIFT-FST-08' },
          { size: 'UK 9', stock: 14, sku: 'CALZ-WLR-DRIFT-FST-09' },
          { size: 'UK 10', stock: 7, sku: 'CALZ-WLR-DRIFT-FST-10' },
        ],
      },
      {
        productId: p6._id,
        colorName: 'Midnight Obsidian',
        colorHex: '#0D0E10',
        variantSku: 'CALZ-WLR-DRIFT-OBS',
        regularPrice: 1399,
        salePrice: 849,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=85',
            alt: 'Midnight Obsidian Drift Walker',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 10, sku: 'CALZ-WLR-DRIFT-OBS-06' },
          { size: 'UK 7', stock: 16, sku: 'CALZ-WLR-DRIFT-OBS-07' },
          { size: 'UK 8', stock: 22, sku: 'CALZ-WLR-DRIFT-OBS-08' },
          { size: 'UK 9', stock: 13, sku: 'CALZ-WLR-DRIFT-OBS-09' },
          { size: 'UK 10', stock: 6, sku: 'CALZ-WLR-DRIFT-OBS-10' },
        ],
      },
    ]);

    console.log('[Seed] 6 Products with 15 Color Variants and 80+ sellable SKUs created');

    // 5. Customer Reviews
    await Review.create([
      {
        product: p1._id,
        user: customerUser._id,
        customerName: 'Kavya Sharma',
        customerEmail: 'kavya@example.com',
        rating: 5,
        title: 'Insanely comfortable for rainy Bengaluru commutes',
        comment:
          'Got the Oat Beige in UK 7. I commute on the metro and walk 2 km daily. Zero blisters, totally waterproof, and they look chic enough for casual office Fridays.',
        verifiedPurchase: true,
        status: 'approved',
        isFeatured: true,
      },
      {
        product: p1._id,
        customerName: 'Rohan Mehra',
        customerEmail: 'rohan@example.com',
        rating: 5,
        title: 'Better than international foam brands',
        comment:
          'The heel cushion has serious bounce without feeling mushy. The swivel strap actually stays locked in place. Best 899 rupees I spent this month.',
        verifiedPurchase: true,
        status: 'approved',
        isFeatured: true,
      },
      {
        product: p2._id,
        customerName: 'Aditi Varma',
        customerEmail: 'aditi@example.com',
        rating: 5,
        title: 'Desert Clay color is stunning in person',
        comment:
          'The terracotta/clay tone is so sophisticated. The 35mm thick sole feels like walking on marshmallows.',
        verifiedPurchase: true,
        status: 'approved',
        isFeatured: true,
      },
      {
        product: p3._id,
        customerName: 'Vikramaditya Nair',
        customerEmail: 'vikram@example.com',
        rating: 5,
        title: 'Rock solid grip on wet monsoon granite',
        comment:
          'Used these during a trek to Coorg. River crossing, mud, slick rocks - the lugged soles never lost traction once.',
        verifiedPurchase: true,
        status: 'approved',
        isFeatured: true,
      },
    ]);

    // 6. Promotional Coupons
    await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% discount on your first footwear purchase',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 799,
        maxDiscountAmount: 300,
        isActive: true,
      },
      {
        code: 'CALZARE200',
        description: 'Flat ₹200 off on footwear orders above ₹1,499',
        discountType: 'fixed',
        discountValue: 200,
        minOrderValue: 1499,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        description: 'Free express shipping on all orders',
        discountType: 'fixed',
        discountValue: 99,
        minOrderValue: 499,
        isActive: true,
      },
    ]);

    // 7. Store Settings
    await StoreSetting.create({
      storeName: 'CALZARE',
      tagline: 'Good Shoes. Loud Personality.',
      contactEmail: 'concierge@calzarefootwear.com',
      contactPhone: '+91 98765 43210',
      businessAddress: 'CALZARE Footwear Studio, 12th Main Road, Indiranagar, Bengaluru, KA 560038',
      freeShippingThreshold: 999,
      defaultShippingFee: 99,
      codEnabled: true,
      codFee: 49,
      taxRatePercentage: 18,
      razorpayEnabled: true,
      razorpayKeyId: 'rzp_test_calzare12345',
      themeTokens: {
        primaryAccent: '#d8ff00', // Electric lime
        secondaryAccent: '#ff5d2b', // Tangerine
        darkCanvas: '#0f0f10',
        lightCanvas: '#f8f6f0',
        glassmorphismIntensity: 'subtle',
      },
    });

    // 8. Navigation Menus
    await NavigationMenu.create([
      {
        menuKey: 'announcement_bar',
        title: 'Storefront Announcement Bar',
        isActive: true,
        items: [
          {
            label: '📦 FREE EXPRESS SHIPPING ON ALL PREPAID ORDERS OVER ₹999',
            url: '/shop',
            badge: 'FREE',
          },
          {
            label: '⚡ 100% WATERPROOF DUAL-DENSITY ARCHITECTURAL FOAM FOOTWEAR',
            url: '/shop',
            badge: 'FEATURED',
          },
        ],
        metadata: {
          announcementRotating: true,
          rotationIntervalSec: 4,
          bgColor: '#0f0f10',
          textColor: '#f8f6f0',
        },
      },
      {
        menuKey: 'header',
        title: 'Primary Storefront Navigation',
        isActive: true,
        items: [
          { label: 'Men', url: '/men' },
          { label: 'Women', url: '/women' },
          { label: 'Kids', url: '/kids' },
          { label: 'Our Story', url: '/about' },
          { label: 'Contact', url: '/contact' },
        ],
        metadata: {
          stickyHeader: true,
          logoText: 'CALZARE',
        },
      },
      {
        menuKey: 'footer_shop',
        title: 'Shop Footwear',
        isActive: true,
        items: [
          { label: 'Cloud Hydro Clogs', url: '/shop?category=clogs' },
          { label: 'Aeroflex Sliders', url: '/shop?category=sliders' },
          { label: 'HydroGrip Sandals', url: '/shop?category=sandals' },
          { label: 'NeoFoam Walkers', url: '/shop?category=foam-walkers' },
          { label: 'Under ₹999 Store', url: '/collections/under-999-store' },
        ],
      },
      {
        menuKey: 'footer_help',
        title: 'Customer Care',
        isActive: true,
        items: [
          { label: 'Track Order', url: '/account/orders' },
          { label: 'Size Guide', url: '/pages/size-guide' },
          { label: 'Shipping & Delivery', url: '/pages/shipping-policy' },
          { label: '7-Day Returns & Exchange', url: '/pages/return-exchange-policy' },
          { label: 'FAQs', url: '/pages/faqs' },
          { label: 'Contact Us', url: '/pages/contact-us' },
        ],
      },
      {
        menuKey: 'footer_about',
        title: 'Brand & Studio',
        isActive: true,
        items: [
          { label: 'About CALZARE', url: '/pages/about-us' },
          { label: 'Material Science', url: '/pages/about-us' },
          { label: 'Privacy Policy', url: '/pages/privacy-policy' },
          { label: 'Terms & Conditions', url: '/pages/terms-and-conditions' },
        ],
      },
    ]);

    // 9. CMS Informational & Policy Pages
    await CMSPage.create([
      {
        title: 'About CALZARE Footwear',
        slug: 'about-us',
        category: 'info',
        content: `
          <h2>0% Boring. 100% Air.</h2>
          <p>CALZARE was born out of frustration with disposable, hard-plastic footwear that sacrifices comfort for style or style for orthopedic clunkiness.</p>
          <p>We craft high-density closed-cell EVA footwear designed for 16-hour daily movement. From monsoon sidewalks to creative studios, airport terminals, and mountain streams, CALZARE delivers uncompromised buoyancy and architectural silhouette design.</p>
          <h3>Our Foam Philosophy</h3>
          <p>Every pair is injection-molded with our proprietary CloudFootbed recipe — combining impact-dampening rebound with lightweight closed-cell hygiene that never absorbs water or odors.</p>
        `,
        excerpt: 'The story behind CALZARE: architectural closed-cell footwear built for real life.',
      },
      {
        title: 'Official Size Guide & Foot Measurement',
        slug: 'size-guide',
        category: 'guide',
        content: `
          <h2>Find Your Perfect Fit (UK / India Standard)</h2>
          <p>CALZARE footwear runs true to standard UK/India sizing. If you have wide feet or prefer extra room with socks, we recommend sizing one up.</p>
          <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; margin-top:16px;">
            <tr style="background:#f4f4f4;"><th>UK / India</th><th>EU Size</th><th>US Men</th><th>US Women</th><th>Foot Length (CM)</th></tr>
            <tr><td>UK 5</td><td>EU 38</td><td>US 6</td><td>US 7</td><td>24.2 cm</td></tr>
            <tr><td>UK 6</td><td>EU 39</td><td>US 7</td><td>US 8</td><td>25.0 cm</td></tr>
            <tr><td>UK 7</td><td>EU 41</td><td>US 8</td><td>US 9</td><td>25.8 cm</td></tr>
            <tr><td>UK 8</td><td>EU 42</td><td>US 9</td><td>US 10</td><td>26.6 cm</td></tr>
            <tr><td>UK 9</td><td>EU 43</td><td>US 10</td><td>US 11</td><td>27.5 cm</td></tr>
            <tr><td>UK 10</td><td>EU 45</td><td>US 11</td><td>US 12</td><td>28.3 cm</td></tr>
          </table>
        `,
      },
      {
        title: 'Shipping & Delivery Policy',
        slug: 'shipping-policy',
        category: 'policy',
        content: `
          <h2>Fast & Reliable Express Shipping</h2>
          <p>All CALZARE orders are dispatched from our central fulfillment hub within 24 hours of confirmation.</p>
          <ul>
            <li><strong>Metro Cities:</strong> 2 to 4 business days</li>
            <li><strong>Rest of India:</strong> 4 to 6 business days</li>
            <li><strong>Shipping Fee:</strong> FREE for prepaid orders over ₹999. Flat ₹99 for orders under ₹999.</li>
            <li><strong>Cash on Delivery:</strong> Available across 18,000+ PIN codes with flat ₹49 COD processing fee.</li>
          </ul>
        `,
      },
      {
        title: '7-Day Hassle-Free Returns & Exchange Policy',
        slug: 'return-exchange-policy',
        category: 'policy',
        content: `
          <h2>Easy 7-Day Doorstep Exchange</h2>
          <p>Size didn't fit? We've got you covered. We offer free size exchanges within 7 days of delivery.</p>
          <p>Products must be unused, unwashed, and in original packaging with tags intact. Initiating an exchange takes under 60 seconds from your Account order panel.</p>
        `,
      },
      {
        title: 'Frequently Asked Questions (FAQs)',
        slug: 'faqs',
        category: 'info',
        content: `
          <h2>Common Questions</h2>
          <h4>Are CALZARE clogs completely waterproof?</h4>
          <p>Yes, 100%. Our footwear is molded from non-porous closed-cell EVA. They do not absorb moisture, can be washed with mild soap and tap water, and air dry in minutes.</p>
          <h4>Can I wear these in heat and sun?</h4>
          <p>Yes. Like all premium EVA footwear, do not leave them inside a hot car under direct blazing sun for days, as intense enclosed thermal exposure can cause shrinkage.</p>
        `,
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        category: 'legal',
        content: '<p>Your privacy is paramount. We do not sell or trade your personal data. All payment transactions are encrypted using bank-grade TLS.</p>',
      },
      {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        category: 'legal',
        content: '<p>Welcome to CALZARE Footwear. By browsing or purchasing through this website, you agree to our standard commerce terms.</p>',
      },
      {
        title: 'Contact Concierge',
        slug: 'contact-us',
        category: 'info',
        content: `
          <h2>Get in Touch</h2>
          <p>Have questions about sizing, drops, or existing orders?</p>
          <p><strong>Email:</strong> concierge@calzarefootwear.com</p>
          <p><strong>WhatsApp Support:</strong> +91 98765 43210 (Mon-Sat, 10 AM - 7 PM IST)</p>
          <p><strong>Studio:</strong> 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038</p>
        `,
      },
      {
        title: 'Shipping & Delivery Policy',
        slug: 'shipping',
        category: 'policy',
        content: `
          <h2>Express Dispatch & Delivery</h2>
          <p>At CALZARE, every pair is dispatched from our central fulfillment hub within 24 hours of payment verification.</p>
          <ul>
            <li><strong>Metro Cities:</strong> 2 to 3 business days via priority express air courier.</li>
            <li><strong>Tier II & III Cities:</strong> 3 to 5 business days.</li>
            <li><strong>Free Shipping:</strong> 100% FREE express shipping on all orders above ₹999.</li>
          </ul>
        `,
        excerpt: 'Fast express courier across India within 2-4 business days. Free shipping over ₹999.',
      },
      {
        title: '7-Day Doorstep Returns & Exchanges',
        slug: 'returns',
        category: 'policy',
        content: `
          <h2>7-Day Doorstep Reverse Pickup & Size Swap</h2>
          <p>Finding your perfect footwear fit is essential. That is why CALZARE offers a streamlined, 7-day doorstep reverse pickup exchange.</p>
          <p>Ensure the footwear is unworn outdoors, clean, and in original packaging with tags intact. Our courier collects the existing pair and delivers your replacement size in one smooth transition.</p>
        `,
        excerpt: 'Hassle-free 7-day doorstep size swap across all Indian pin codes.',
      },
      {
        title: 'Refund Policy & Guarantee',
        slug: 'refund-policy',
        category: 'policy',
        content: `
          <h2>100% Transparent Refund Policy</h2>
          <p>Customer satisfaction is non-negotiable. If you prefer a refund over an exchange, refunds are processed promptly upon quality inspection of returned merchandise.</p>
          <p>Prepaid payments are refunded to the original payment source within 24 hours (reflecting in 3-5 bank days). COD orders are refunded via instant UPI payout link or direct NEFT.</p>
        `,
        excerpt: '100% money back guarantee for unworn footwear returned within 7 days.',
      },
      {
        title: 'Privacy & Data Protection',
        slug: 'privacy',
        category: 'legal',
        content: '<p>Your privacy is strictly guarded. We never sell customer records. Transactions are tokenized and processed through PCI-DSS Level 1 certified gateways.</p>',
        excerpt: 'Strict data protection and zero sharing policy.',
      },
      {
        title: 'Terms of Service',
        slug: 'terms',
        category: 'legal',
        content: '<p>Official terms of service governing user accounts, purchases, and warranties for CALZARE Footwear products.</p>',
        excerpt: 'Official commercial conditions and customer rights.',
      },
      {
        title: 'The Architecture of Zero-Gravity Foam: Inside CALZARE’s Material Science',
        slug: 'foam-revolution-closed-cell-eva',
        category: 'journal',
        heroImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
        author: 'Arjun Mehta, Material Engineer',
        readTime: '4 min read',
        tags: ['Material Science', 'EVA Innovation', 'Footbed Ergonomics'],
        excerpt: 'Why conventional injection rubber wears out your knees, and how closed-cell supercritical micro-foaming creates indestructible, buoyant cushioning.',
        content: `
          <h2>The Architecture of Zero-Gravity Foam</h2>
          <p>Conventional casual footwear relies on open-cell polymers or heavy bonded vulcanized rubber. While initially soft, these compounds degrade rapidly under body heat, trap moisture, and accumulate microbial odor.</p>
          <h3>The Supercritical Breakthrough</h3>
          <p>CALZARE silhouettes utilize precision closed-cell EVA injected under high-temperature pressurized molds. Because the microscopic cell walls remain completely sealed, water, dirt, and street oils cannot penetrate the internal structure.</p>
          <p>Instead of flattening out under foot strike, the cells act as microscopic pneumatic springs, absorbing shock and protecting the lumbar spine across extended commutes.</p>
        `,
      },
      {
        title: 'Monsoon Urban Wear: How to Style Chunky Clogs from Concrete to Rain',
        slug: 'monsoon-ready-streetwear-styling',
        category: 'journal',
        heroImage: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80',
        author: 'Priya Sen, Creative Stylist',
        readTime: '3 min read',
        tags: ['Street Style', 'Monsoon Fashion', 'Lookbook'],
        excerpt: 'Step boldly through sudden downpours without sacrificing high-fashion silhouette proportions. 4 street style recipes for chunky waterproof clogs.',
        content: `
          <h2>Monsoon Urban Wear: Styling Chunky Silhouettes</h2>
          <p>Footwear during heavy tropical showers used to mean compromised style — flimsy flip-flops or heavy cumbersome rain boots. The modern street fashion renaissance changed that equation forever.</p>
          <h3>The Relaxed Tech-Cargo Silhouette</h3>
          <p>Pair the Apex Hydro Clog in Chalk White with wide-legged nylon parachute trousers and a cropped technical overshirt. The structured volume of the clog grounds the relaxed drape of the trousers, while the water-shedding compound guarantees completely dry comfort.</p>
        `,
      },
      {
        title: 'Durability Over Disposal: Engineering Circular Footwear',
        slug: 'circular-footwear-future',
        category: 'journal',
        heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        author: 'CALZARE Collective',
        readTime: '5 min read',
        tags: ['Sustainability', 'Circular Design', 'Philosophy'],
        excerpt: 'The most sustainable shoe is the one that never separates into glue, stitching, and micro-plastics. Why single-body injection molds represent the future.',
        content: `
          <h2>Durability Over Disposal</h2>
          <p>The traditional sneaker industry assembles upwards of 60 individual components glued together with toxic adhesives. When a single seam fails, the entire product ends up in landfill.</p>
          <h3>Monolithic Injection Architecture</h3>
          <p>By manufacturing each CALZARE clog and slide as a monolithic, single-material injection component, we eradicate glue degradation entirely. There are no stitches to rot in the wet, no air bags to pop, and no multi-layer soles to delaminate.</p>
        `,
      },
    ]);

    // 10. Dynamic Homepage Sections (CMS Modules with Funky Art Direction & Restrained Glassmorphism!)
    await HomepageSection.create([
      // Section A: Hero Campaign Banner
      {
        sectionKey: 'hero_main',
        sectionType: 'hero',
        title: '0% BORING.\n100% AIR.',
        subtitle: 'Dual-density closed cell waterproof foam. Sculpted for pavement poets and real life strides.',
        eyebrow: '',
        displayOrder: 0,
        isEnabled: true,
        config: {
          layoutVariant: 'asymmetric_editorial',
          backgroundTreatment: 'warm_cream',
          glassIntensity: 'subtle',
          accentColor: '#d8ff00',
          textColor: '#0f0f10',
          desktopMediaUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1400&q=85',
          mobileMediaUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85',
          mediaType: 'image',
          primaryCtaLabel: 'EXPLORE COLLECTION',
          primaryCtaLink: '/shop',
          secondaryCtaLabel: '',
          secondaryCtaLink: '',
          stickers: [
            { text: '🔥 100% WATERPROOF FOAM', badgeStyle: 'lime_pill', position: 'top_right' },
            { text: '☁️ CLOUDFOOTBED TECH', badgeStyle: 'glass_float', position: 'bottom_left' },
          ],
        },
      },
      // Section B: Trust Ticker
      {
        sectionKey: 'trust_ticker',
        sectionType: 'ticker',
        title: 'Live Ticker',
        displayOrder: 1,
        isEnabled: true,
        config: {
          tickerSpeed: 25,
          tickerDirection: 'left',
          backgroundTreatment: 'ink_black',
          tickerMessages: [
            { id: 't1', text: '4.9★ RATED BY 12,000+ INDIAN WALKERS', highlight: 'VERIFIED', iconName: 'Star' },
            { id: 't2', text: '100% WATERPROOF CLOSED-CELL FOAM', highlight: 'MONSOON-PROOF', iconName: 'Droplets' },
            { id: 't3', text: 'FREE EXPRESS SHIPPING ACROSS INDIA OVER ₹999', highlight: 'FAST DISPATCH', iconName: 'Truck' },
            { id: 't4', text: '7-DAY HASSLE-FREE DOORSTEP SIZE EXCHANGE', highlight: 'EASY RETURNS', iconName: 'RotateCcw' },
            { id: 't5', text: 'DIRECT FROM DESIGN LAB — NO MIDDLEMEN MARKUPS', highlight: 'HONEST PRICE', iconName: 'ShieldCheck' },
          ],
        },
      },
      // Section C: Bestsellers Carousel
      {
        sectionKey: 'bestsellers',
        sectionType: 'bestsellers',
        title: 'CROWD FAVORITES',
        subtitle: 'The silhouettes moving fastest off our shelves this season.',
        eyebrow: '',
        displayOrder: 2,
        isEnabled: true,
        config: {
          productSource: 'auto_bestseller',
          maxProducts: 8,
          columnsDesktop: 4,
          columnsMobile: 2,
          layoutVariant: 'funky_grid',
        },
      },
      // Section D: Shop by Audience Cards
      {
        sectionKey: 'shop_audience',
        sectionType: 'audience_cards',
        title: 'DESIGNED FOR EVERY STRIDE',
        subtitle: 'Pick your silhouette designed with zero gender limits.',
        eyebrow: '',
        displayOrder: 3,
        isEnabled: true,
        config: {
          layoutVariant: 'asymmetric_trio',
          audienceCards: [
            {
              id: 'aud_w',
              title: 'WOMEN',
              tagline: 'Sculpted contours & bold vibrant silhouettes.',
              imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80',
              ctaLabel: 'EXPLORE WOMEN',
              link: '/women',
              badge: 'CURATED',
            },
            {
              id: 'aud_m',
              title: 'MEN',
              tagline: 'High-traction outdoor & rugged everyday mules.',
              imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
              ctaLabel: 'EXPLORE MEN',
              link: '/men',
              badge: 'POPULAR',
            },
            {
              id: 'aud_k',
              title: 'KIDS',
              tagline: 'Featherweight, indestructible foam for playground champions.',
              imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
              ctaLabel: 'EXPLORE KIDS',
              link: '/kids',
              badge: 'MINI SIZES',
            },
            {
              id: 'aud_u',
              title: 'UNISEX',
              tagline: 'Pure architectural foam with universal ergonomics.',
              imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
              ctaLabel: 'EXPLORE UNISEX',
              link: '/unisex',
              badge: 'CORE LINE',
            },
          ],
        },
      },
      // Section E: The ₹999 Storefront
      {
        sectionKey: 'affordable_store',
        sectionType: 'affordable_store',
        title: 'THE UNDER ₹999 STORE',
        subtitle: 'High performance foam shouldn’t cost a week’s wage. Premium daily comfort at honest prices.',
        eyebrow: '',
        displayOrder: 4,
        isEnabled: true,
        config: {
          priceCap: 999,
          maxProducts: 6,
          backgroundTreatment: 'stone_light',
          glassIntensity: 'subtle',
          ctaLabel: 'VIEW ALL UNDER ₹999',
          ctaLink: '/collections/under-999-store',
        },
      },
      // Section F: Featured Collection Storytelling
      {
        sectionKey: 'storytelling',
        sectionType: 'storytelling',
        title: 'BUILT FOR REAL LIFE & WILD PERSONALITIES',
        subtitle: 'Why we engineered the CloudFootbed from scratch.',
        eyebrow: '',
        displayOrder: 5,
        isEnabled: true,
        config: {
          layoutVariant: 'editorial_split',
          storytelling: {
            headline: 'WE DON’T DO FLAT SOLES OR RIGID PLASTIC.',
            quote: '“Footwear should act like an extension of gravity, not a restriction on it.”',
            bodyText:
              'We tested 42 foam compound densities across Bengaluru pavement, Mumbai monsoons, and Jaipur heat before releasing our Apex silhouette. The outcome: closed-cell buoyancy that supports your arch while letting you walk 20,000 steps without calf fatigue.',
            signature: 'CALZARE DESIGN LAB, BENGALURU',
            primaryImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
            secondaryImageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
            ctaLabel: 'READ THE FULL STORY',
            ctaLink: '/pages/about-us',
          },
        },
      },
      // Section G: Category Discovery
      {
        sectionKey: 'category_discovery',
        sectionType: 'category_discovery',
        title: 'CHOOSE YOUR SILHOUETTE',
        subtitle: 'Tailored for every occasion, terrain, and state of mind.',
        eyebrow: '',
        displayOrder: 6,
        isEnabled: true,
        config: {
          categoryTiles: [
            {
              id: 'c1',
              title: 'CLOUD CLOGS',
              subtitle: 'Arch ventilation & pivot heel straps',
              imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
              link: '/shop?category=clogs',
            },
            {
              id: 'c2',
              title: 'URBAN SLIDERS',
              subtitle: '35mm thick shock absorbent sole',
              imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
              link: '/shop?category=sliders',
            },
            {
              id: 'c3',
              title: 'HYDRO SANDALS',
              subtitle: 'Trail lugs for wet terrain grip',
              imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
              link: '/shop?category=sandals',
            },
            {
              id: 'c4',
              title: 'FOAM WALKERS',
              subtitle: 'Avant-garde streetwear mules',
              imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
              link: '/shop?category=foam-walkers',
            },
          ],
        },
      },
      // Section H: Verified Customer Reviews
      {
        sectionKey: 'customer_reviews',
        sectionType: 'reviews',
        title: 'WORDS FROM THE PAVEMENT',
        subtitle: 'Honest reviews from customers walking in real rain, heat, and city transit.',
        eyebrow: '',
        displayOrder: 7,
        isEnabled: true,
        config: {
          glassIntensity: 'subtle',
        },
      },
      // Section I: Benefits & Trust Blocks
      {
        sectionKey: 'benefits_trust',
        sectionType: 'benefits',
        title: 'THE CALZARE STANDARD',
        subtitle: 'Built with science. Tested with life.',
        eyebrow: '',
        displayOrder: 8,
        isEnabled: true,
        config: {
          benefitItems: [
            {
              id: 'b1',
              iconName: 'Droplets',
              title: '100% Waterproof',
              description: 'Non-porous closed-cell EVA never absorbs water, dirt, or bad odors. Wash with tap water and wear instantly.',
            },
            {
              id: 'b2',
              iconName: 'Feather',
              title: 'Featherlight Buoyancy',
              description: 'Weighing under 280 grams per pair, experience effortless rebound that feels like stepping on soft clouds.',
            },
            {
              id: 'b3',
              iconName: 'HeartHandshake',
              title: 'Ortho-Spine Arch Support',
              description: 'Engineered footbed contours distribute body weight evenly to protect lower back and ankles during long walks.',
            },
            {
              id: 'b4',
              iconName: 'RotateCcw',
              title: '7-Day Easy Exchange',
              description: 'Got the wrong size? Our delivery partner picks up and swaps your pair directly at your doorstep without fuss.',
            },
          ],
        },
      },
      // Section J: VIP Newsletter Box
      {
        sectionKey: 'newsletter',
        sectionType: 'newsletter',
        title: 'DON’T MISS THE NEXT DROP.',
        subtitle: 'Sign up for early drop notifications, secret colorways, and VIP discount access.',
        eyebrow: '',
        displayOrder: 9,
        isEnabled: true,
        config: {
          backgroundTreatment: 'ink_black',
          glassIntensity: 'medium',
          accentColor: '#d8ff00',
        },
      },
    ]);

    console.log('[Seed] 10 Dynamic Homepage Sections created with custom art direction and CMS settings');

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedDatabase();
