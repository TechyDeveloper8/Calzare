import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Category } from '../models/Category.js';
import { Collection } from '../models/Collection.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { StoreSetting } from '../models/StoreSetting.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { HomepageSection } from '../models/HomepageSection.js';
import { logAudit } from '../utils/auditLogger.js';
import { fshipService } from '../services/fshipService.js';
import slugify from 'slugify';

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      collection: collectionSlug,
      audience,
      productType,
      minPrice,
      maxPrice,
      color,
      size,
      availability,
      search,
      sort = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'published' };

    // Filter by Category
    if (category) {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        query.category = foundCategory._id;
      }
    }

    // Filter by Collection
    if (collectionSlug) {
      const foundCollection = await Collection.findOne({ slug: collectionSlug });
      if (foundCollection) {
        if (foundCollection.ruleType === 'price_under') {
          query.baseSalePrice = { $lte: Number(foundCollection.ruleValue) || 999 };
        } else if (foundCollection.ruleType === 'manual' && foundCollection.manualProductIds?.length) {
          query._id = { $in: foundCollection.manualProductIds };
        } else {
          query.collections = foundCollection._id;
        }
      }
    }

    // Filter by Audience
    if (audience && audience !== 'All') {
      if (audience === 'Kids') {
        query.audience = 'Kids';
      } else if (audience === 'Unisex') {
        query.audience = 'Unisex';
      } else {
        query.audience = { $in: [audience, 'Unisex'] };
      }
    }

    // Filter by Product Type
    if (productType) {
      query.productType = productType;
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.baseSalePrice = {};
      if (minPrice) query.baseSalePrice.$gte = Number(minPrice);
      if (maxPrice) query.baseSalePrice.$lte = Number(maxPrice);
    }

    // Search query
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { sku: regex }, { tags: regex }, { shortDescription: regex }];
    }

    // Color or Size filtering requires querying ProductVariants first
    if (color || size) {
      const variantQuery = { isActive: true };
      if (color) {
        variantQuery.colorName = { $regex: new RegExp(color, 'i') };
      }
      if (size) {
        variantQuery.sizes = { $elemMatch: { size, stock: { $gt: 0 } } };
      }
      const matchingVariants = await ProductVariant.find(variantQuery).distinct('productId');
      query._id = { ...(query._id ? { $in: matchingVariants.filter((id) => query._id.$in?.includes(id)) } : { $in: matchingVariants }) };
    }

    // Filter by Availability (in stock vs all)
    if (availability === 'in_stock') {
      const inStockProductIds = await ProductVariant.find({
        isActive: true,
        'sizes.stock': { $gt: 0 },
      }).distinct('productId');
      query._id = query._id
        ? { $in: inStockProductIds.filter((id) => query._id.$in?.some((existing) => (existing.equals ? existing.equals(id) : String(existing) === String(id)))) }
        : { $in: inStockProductIds };
    }

    // Sorting
    let sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === 'bestselling') {
      sortOption = { salesCount: -1, averageRating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'price_asc') {
      sortOption = { baseSalePrice: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { baseSalePrice: -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('collections', 'name slug')
      .populate('variants')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Explicit inheritance resolution for PDP Brand Comparison section
// Priority: Product-specific -> Collection-level -> Global default -> None
export const resolveBrandComparison = (product, storeSettings, isStaff = false) => {
  // 1. Product-specific comparison configuration, when one exists.
  const prodBC = product?.brandComparison;
  if (prodBC && prodBC.mode === 'disabled') {
    return {
      source: 'product',
      mode: 'disabled',
      isEnabled: false,
      isPublished: true,
      isVisible: false,
      reason: 'Explicitly disabled at product level',
    };
  }

  if (prodBC && prodBC.mode === 'custom') {
    const hasMedia = Boolean(prodBC.desktopMediaUrl);
    const isPub = prodBC.isPublished !== false;
    const isEn = prodBC.isEnabled !== false;
    const isVisible = isEn && hasMedia && (isPub || isStaff);

    return {
      source: 'product',
      mode: 'custom',
      isEnabled: isEn,
      isPublished: isPub,
      isDraft: !isPub,
      isVisible,
      heading: prodBC.heading || 'SEE THE DIFFERENCE',
      subheading: prodBC.subheading || '',
      desktopMediaUrl: prodBC.desktopMediaUrl || '',
      mobileMediaUrl: prodBC.mobileMediaUrl || '',
      altText: prodBC.altText || 'Brand comparison',
      displayOrder: prodBC.displayOrder || 0,
    };
  }

  // 2. Collection-level configuration, if supported and applicable.
  if (Array.isArray(product?.collections)) {
    for (const col of product.collections) {
      const colBC = col?.brandComparison;
      if (colBC && colBC.isEnabled && colBC.desktopMediaUrl) {
        const isPub = colBC.isPublished !== false;
        const isVisible = isPub || isStaff;
        return {
          source: 'collection',
          collectionName: col.name,
          collectionSlug: col.slug,
          mode: 'collection',
          isEnabled: true,
          isPublished: isPub,
          isDraft: !isPub,
          isVisible,
          heading: colBC.heading || 'SEE THE DIFFERENCE',
          subheading: colBC.subheading || '',
          desktopMediaUrl: colBC.desktopMediaUrl || '',
          mobileMediaUrl: colBC.mobileMediaUrl || '',
          altText: colBC.altText || 'Brand comparison',
          displayOrder: colBC.displayOrder || 0,
        };
      }
    }
  }

  // 3. Global default configuration.
  const globalBC = storeSettings?.brandComparisonDefault;
  if (globalBC && globalBC.isEnabled && globalBC.desktopMediaUrl) {
    let inScope = false;
    const scope = globalBC.scope || 'all';

    if (scope === 'all') {
      inScope = true;
    } else if (scope === 'selected_products') {
      const prodIdStr = product?._id?.toString();
      const selectedIds = (globalBC.selectedProductIds || []).map((id) => id?.toString());
      inScope = selectedIds.includes(prodIdStr);
    } else if (scope === 'selected_collections') {
      const prodColIds = (product?.collections || []).map((c) => (c._id ? c._id.toString() : c.toString()));
      const selectedColIds = (globalBC.selectedCollectionIds || []).map((id) => id?.toString());
      inScope = prodColIds.some((cId) => selectedColIds.includes(cId));
    }

    if (inScope) {
      const isPub = globalBC.isPublished !== false;
      const isVisible = isPub || isStaff;
      return {
        source: 'global',
        mode: 'global',
        isEnabled: true,
        isPublished: isPub,
        isDraft: !isPub,
        isVisible,
        heading: globalBC.heading || 'SEE THE DIFFERENCE',
        subheading: globalBC.subheading || '',
        desktopMediaUrl: globalBC.desktopMediaUrl || '',
        mobileMediaUrl: globalBC.mobileMediaUrl || '',
        altText: globalBC.altText || 'Brand comparison',
        displayOrder: globalBC.displayOrder || 0,
      };
    }
  }

  // 4. Default: No valid published configuration exists
  return {
    source: 'none',
    mode: 'none',
    isEnabled: false,
    isPublished: true,
    isVisible: false,
  };
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query = isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug };
    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('collections', 'name slug brandComparison')
      .populate({
        path: 'relatedProducts',
        select: 'name slug baseRegularPrice baseSalePrice defaultImages productType brand isBestseller isNewArrival',
        populate: { path: 'variants', select: 'colorName colorHex regularPrice salePrice images' },
      })
      .populate({
        path: 'variants',
        match: { isActive: true },
        options: { sort: { displayOrder: 1 } },
      });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view counter asynchronously without blocking response
    Product.updateOne({ _id: product._id }, { $inc: { viewsCount: 1 } }).exec().catch(() => {});

    // Ensure at least 4 related products are returned for rich recommendation carousels
    let relatedProducts = product.relatedProducts ? [...product.relatedProducts] : [];
    if (relatedProducts.length < 4) {
      const existingIds = [product._id, ...relatedProducts.map((p) => p._id)];
      const categoryFilter = product.category?._id ? { category: product.category._id } : {};
      
      let additional = await Product.find({
        _id: { $nin: existingIds },
        status: 'published',
        ...categoryFilter,
      })
        .select('name slug baseRegularPrice baseSalePrice defaultImages productType brand isBestseller isNewArrival')
        .populate('variants', 'colorName colorHex regularPrice salePrice images')
        .limit(4 - relatedProducts.length)
        .lean();

      if (relatedProducts.length + additional.length < 4) {
        const allExisting = [...existingIds, ...additional.map((p) => p._id)];
        const genericAdditional = await Product.find({
          _id: { $nin: allExisting },
          status: 'published',
        })
          .select('name slug baseRegularPrice baseSalePrice defaultImages productType brand isBestseller isNewArrival')
          .populate('variants', 'colorName colorHex regularPrice salePrice images')
          .limit(4 - (relatedProducts.length + additional.length))
          .lean();
        additional = [...additional, ...genericAdditional];
      }

      relatedProducts = [...relatedProducts, ...additional];
    }

    // Fetch approved reviews
    const reviews = await Review.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 });

    // Fetch store-wide PDP copy defaults and brand comparison default
    const storeSettings = await StoreSetting.findOne().select('productPageDefaults brandComparisonDefault freeShippingThreshold defaultShippingFee codEnabled codFee');

    const isStaff = Boolean(req.user && ['admin', 'superadmin', 'product_manager'].includes(req.user.role));
    const effectiveBrandComparison = resolveBrandComparison(product, storeSettings, isStaff);
    const finalBrandComparison = (isStaff || effectiveBrandComparison?.isVisible)
      ? (effectiveBrandComparison?.isVisible || isStaff ? (effectiveBrandComparison?.mode === 'disabled' && !isStaff ? null : effectiveBrandComparison) : null)
      : null;

    const productObj = product.toObject({ virtuals: true });
    productObj.relatedProducts = relatedProducts;

    res.json({
      success: true,
      product: productObj,
      reviews,
      globalDefaults: storeSettings?.productPageDefaults || {},
      brandComparisonDefault: storeSettings?.brandComparisonDefault || null,
      brandComparison: (!isStaff && (!effectiveBrandComparison?.isVisible || effectiveBrandComparison?.mode === 'disabled')) ? null : effectiveBrandComparison,
      storePolicy: {
        freeShippingThreshold: storeSettings?.freeShippingThreshold || 999,
        defaultShippingFee: storeSettings?.defaultShippingFee || 99,
        codEnabled: storeSettings?.codEnabled !== false,
        codFee: storeSettings?.codFee || 49,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkDeliveryPincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    const cleanPincode = String(pincode || '').trim();

    // Indian postal code validation: 6 digits, first digit 1-9
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian postal code.',
      });
    }

    const storeSetting = await StoreSetting.findOne().lean();
    const freeShippingThreshold = storeSetting?.freeShippingThreshold || 999;
    const codEnabled = storeSetting?.codEnabled !== false;

    // Use FShip logistics service client
    const fshipResult = await fshipService.checkServiceability({
      deliveryPincode: cleanPincode,
      pickupPincode: storeSetting?.fship?.pickupPincode || '560038',
      weightKg: 0.5,
      cod: codEnabled,
    });

    res.json({
      ...fshipResult,
      freeShippingThreshold,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      status: 'published',
      $or: [{ name: regex }, { sku: regex }, { tags: regex }],
    })
      .select('name slug sku baseRegularPrice baseSalePrice defaultImages productType')
      .populate('variants', 'colorName colorHex regularPrice salePrice images')
      .limit(8);

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Admin Endpoints
export const adminCreateProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug: customSlug,
      sku,
      barcode,
      brand,
      tagline,
      shortDescription,
      description,
      features,
      material,
      soleMaterial,
      closureType,
      weightGrams,
      category,
      subcategory,
      collections,
      tags,
      productType,
      audience,
      baseRegularPrice,
      baseSalePrice,
      status,
      isFeatured,
      isBestseller,
      isNewArrival,
      defaultImages,
      videoUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      customCopy,
      storytellingBlocks,
      richFeatures,
      materialsAndCare,
      specifications,
      sizeGuideConfig,
      sizeChart,
      faqs,
      relatedProducts,
      brandComparison,
      initialVariants, // optional array of color variants to create simultaneously
    } = req.body;

    const baseSlug = customSlug
      ? slugify(customSlug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });
    const slug = customSlug
      ? baseSlug
      : `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({
      name,
      slug,
      sku: sku.toUpperCase(),
      barcode,
      brand: brand || 'CALZARE',
      tagline: tagline || '',
      shortDescription,
      description,
      features: features || [],
      material,
      soleMaterial,
      closureType,
      weightGrams,
      category,
      subcategory,
      collections: collections || [],
      tags: tags || [],
      productType: productType || 'Clogs',
      audience: audience || 'Unisex',
      baseRegularPrice,
      baseSalePrice,
      status: status || 'published',
      isFeatured: !!isFeatured,
      isBestseller: !!isBestseller,
      isNewArrival: isNewArrival !== undefined ? !!isNewArrival : true,
      defaultImages: defaultImages || [],
      videoUrl,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || shortDescription,
      seoKeywords: seoKeywords || [],
      ogTitle: ogTitle || seoTitle || name,
      ogDescription: ogDescription || seoDescription || shortDescription,
      ogImage: ogImage || defaultImages?.[0]?.url || '',
      customCopy: customCopy || {},
      storytellingBlocks: storytellingBlocks || [],
      richFeatures: richFeatures || [],
      materialsAndCare: materialsAndCare || {},
      specifications: specifications || [],
      sizeGuideConfig: sizeGuideConfig || {},
      sizeChart: sizeChart || undefined,
      faqs: faqs || [],
      relatedProducts: relatedProducts || [],
      brandComparison: brandComparison || {},
    });

    // Create initial variants if passed
    if (initialVariants && Array.isArray(initialVariants)) {
      for (const v of initialVariants) {
        await ProductVariant.create({
          productId: product._id,
          colorName: v.colorName,
          colorHex: v.colorHex || '#111111',
          variantSku: (v.variantSku || `${sku}-${v.colorName.slice(0, 3)}`).toUpperCase(),
          regularPrice: v.regularPrice || baseRegularPrice,
          salePrice: v.salePrice || baseSalePrice,
          images: v.images || defaultImages,
          sizes: v.sizes || [
            { size: 'UK 6', stock: 10, sku: `${sku}-06` },
            { size: 'UK 7', stock: 15, sku: `${sku}-07` },
            { size: 'UK 8', stock: 20, sku: `${sku}-08` },
            { size: 'UK 9', stock: 15, sku: `${sku}-09` },
            { size: 'UK 10', stock: 10, sku: `${sku}-10` },
          ],
        });
      }
    }

    await logAudit(req, 'CREATE_PRODUCT', 'Product', product._id, { name, sku });

    const createdWithVariants = await Product.findById(product._id).populate('variants');
    res.status(201).json({ success: true, product: createdWithVariants, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.slug && req.body.slug !== product.slug) {
      product.slug = slugify(req.body.slug, { lower: true, strict: true });
    }

    const updatableFields = [
      'name',
      'barcode',
      'brand',
      'tagline',
      'shortDescription',
      'description',
      'features',
      'material',
      'soleMaterial',
      'closureType',
      'weightGrams',
      'warranty',
      'category',
      'subcategory',
      'collections',
      'tags',
      'productType',
      'audience',
      'baseRegularPrice',
      'baseSalePrice',
      'status',
      'isFeatured',
      'isBestseller',
      'isNewArrival',
      'defaultImages',
      'videoUrl',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
      'ogTitle',
      'ogDescription',
      'ogImage',
      'relatedProducts',
      'customCopy',
      'storytellingBlocks',
      'richFeatures',
      'materialsAndCare',
      'specifications',
      'sizeGuideConfig',
      'sizeChart',
      'faqs',
      'brandComparison',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    // Sync color variants if provided
    if (req.body.initialVariants && Array.isArray(req.body.initialVariants)) {
      for (const v of req.body.initialVariants) {
        if (v._id) {
          await ProductVariant.findByIdAndUpdate(v._id, {
            colorName: v.colorName,
            colorHex: v.colorHex,
            variantSku: (v.variantSku || `${product.sku}-${(v.colorName || 'CLR').slice(0, 3)}`).toUpperCase(),
            regularPrice: v.regularPrice || product.baseRegularPrice,
            salePrice: v.salePrice || product.baseSalePrice,
            images: v.images || product.defaultImages,
            sizes: v.sizes,
          });
        } else {
          await ProductVariant.create({
            productId: product._id,
            colorName: v.colorName,
            colorHex: v.colorHex || '#111111',
            variantSku: (v.variantSku || `${product.sku}-${(v.colorName || 'CLR').slice(0, 3)}`).toUpperCase(),
            regularPrice: v.regularPrice || product.baseRegularPrice,
            salePrice: v.salePrice || product.baseSalePrice,
            images: v.images || product.defaultImages,
            sizes: v.sizes,
          });
        }
      }
    }

    await logAudit(req, 'UPDATE_PRODUCT', 'Product', product._id, { changes: req.body });

    const updated = await Product.findById(product._id).populate('variants');
    res.json({ success: true, product: updated, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1. Collect all variant IDs for this product
    const variants = await ProductVariant.find({ productId: product._id }).select('_id');
    const variantIds = variants.map((v) => v._id);

    // 2. Cascade delete all inventory movement records for this product and its variants
    const invRes = await InventoryMovement.deleteMany({
      $or: [
        { product: product._id },
        { variant: { $in: variantIds } },
      ],
    });

    // 3. Cascade delete all product variants (stock records)
    const varRes = await ProductVariant.deleteMany({ productId: product._id });

    // 4. Cascade delete all customer reviews for this product
    const revRes = await Review.deleteMany({ product: product._id });

    // 5. Clean up active shopping carts referencing this product or its variants
    await Cart.updateMany(
      {},
      {
        $pull: {
          items: {
            $or: [
              { product: product._id },
              { variant: { $in: variantIds } },
            ],
          },
        },
      }
    );

    // 6. Clean up customer wishlists referencing this product
    await Wishlist.updateMany(
      {},
      { $pull: { products: product._id } }
    );

    // 7. Clean up manual curation in Collections
    await Collection.updateMany(
      {},
      { $pull: { manualProductIds: product._id } }
    );

    // 8. Clean up homepage section manual selections
    await HomepageSection.updateMany(
      {},
      { $pull: { 'config.selectedProductIds': product._id } }
    );

    // 9. Clean up store settings brand comparison references
    await StoreSetting.updateMany(
      {},
      { $pull: { 'brandComparisonDefault.selectedProductIds': product._id } }
    );

    // 10. Permanently delete the product document
    await product.deleteOne();

    await logAudit(req, 'DELETE_PRODUCT', 'Product', req.params.id, {
      name: product.name,
      sku: product.sku,
      variantsDeleted: varRes.deletedCount,
      inventoryMovementsDeleted: invRes.deletedCount,
      reviewsDeleted: revRes.deletedCount,
    });

    res.json({
      success: true,
      message: `Product "${product.name}", ${varRes.deletedCount} variants, and ${invRes.deletedCount} inventory records deleted permanently from database`,
      stats: {
        variantsDeleted: varRes.deletedCount,
        inventoryMovementsDeleted: invRes.deletedCount,
        reviewsDeleted: revRes.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Color Variant Management
export const adminCreateVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { colorName, colorHex, colorSwatchImage, variantSku, regularPrice, salePrice, images, sizes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Parent product not found' });
    }

    const variant = await ProductVariant.create({
      productId,
      colorName,
      colorHex,
      colorSwatchImage,
      variantSku: variantSku.toUpperCase(),
      regularPrice: regularPrice || product.baseRegularPrice,
      salePrice: salePrice || product.baseSalePrice,
      images: images || product.defaultImages,
      sizes: sizes || [
        { size: 'UK 6', stock: 10, sku: `${variantSku}-06` },
        { size: 'UK 7', stock: 10, sku: `${variantSku}-07` },
        { size: 'UK 8', stock: 10, sku: `${variantSku}-08` },
        { size: 'UK 9', stock: 10, sku: `${variantSku}-09` },
        { size: 'UK 10', stock: 10, sku: `${variantSku}-10` },
      ],
    });

    await logAudit(req, 'CREATE_VARIANT', 'ProductVariant', variant._id, { productId, colorName });
    res.status(201).json({ success: true, variant, message: 'Color variant added successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    const { colorName, colorHex, colorSwatchImage, regularPrice, salePrice, images, sizes, isActive, displayOrder } = req.body;

    if (colorName) variant.colorName = colorName;
    if (colorHex) variant.colorHex = colorHex;
    if (colorSwatchImage !== undefined) variant.colorSwatchImage = colorSwatchImage;
    if (regularPrice !== undefined) variant.regularPrice = regularPrice;
    if (salePrice !== undefined) variant.salePrice = salePrice;
    if (images) variant.images = images;
    if (sizes) variant.sizes = sizes;
    if (isActive !== undefined) variant.isActive = isActive;
    if (displayOrder !== undefined) variant.displayOrder = displayOrder;

    await variant.save();
    await logAudit(req, 'UPDATE_VARIANT', 'ProductVariant', variant._id, { colorName: variant.colorName });

    res.json({ success: true, variant, message: 'Color variant updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    // 1. Cascade delete all inventory movement records for this variant
    const invRes = await InventoryMovement.deleteMany({ variant: variant._id });

    // 2. Remove this variant from all active shopping carts
    await Cart.updateMany({}, { $pull: { items: { variant: variant._id } } });

    // 3. Remove variant from parent Product.variants array if referenced
    await Product.findByIdAndUpdate(variant.productId, { $pull: { variants: variant._id } });

    // 4. Delete the variant document itself
    await variant.deleteOne();

    await logAudit(req, 'DELETE_VARIANT', 'ProductVariant', req.params.variantId, {
      variantSku: variant.variantSku,
      colorName: variant.colorName,
      inventoryMovementsDeleted: invRes.deletedCount,
    });

    res.json({
      success: true,
      message: `Color variant "${variant.colorName}" and ${invRes.deletedCount} associated inventory records deleted permanently`,
      stats: {
        inventoryMovementsDeleted: invRes.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
