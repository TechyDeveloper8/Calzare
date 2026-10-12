import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Category } from '../models/Category.js';
import { Collection } from '../models/Collection.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { logAudit } from '../utils/auditLogger.js';
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

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('collections', 'name slug')
      .populate('relatedProducts', 'name slug baseRegularPrice baseSalePrice defaultImages')
      .populate({
        path: 'variants',
        match: { isActive: true },
        options: { sort: { displayOrder: 1 } },
      });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view counter
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save({ validateBeforeSave: false });

    // Fetch approved reviews
    const reviews = await Review.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      reviews,
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
      sku,
      barcode,
      brand,
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
      defaultImages,
      videoUrl,
      seoTitle,
      seoDescription,
      initialVariants, // optional array of color variants to create simultaneously
    } = req.body;

    const slug = slugify(name, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);

    const product = await Product.create({
      name,
      slug,
      sku: sku.toUpperCase(),
      barcode,
      brand: brand || 'CALZARE',
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
      defaultImages: defaultImages || [],
      videoUrl,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || shortDescription,
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

    const updatableFields = [
      'name',
      'barcode',
      'brand',
      'shortDescription',
      'description',
      'features',
      'material',
      'soleMaterial',
      'closureType',
      'weightGrams',
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
      'relatedProducts',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
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

    // Safety check: verify if historical orders exist
    const orderCount = await Order.countDocuments({ 'items.product': product._id });
    if (orderCount > 0) {
      // Soft-archive instead of deleting to protect audit history
      product.status = 'archived';
      await product.save();
      await logAudit(req, 'ARCHIVE_PRODUCT', 'Product', product._id, { reason: 'Has historical orders' });
      return res.json({
        success: true,
        message: 'Product archived rather than permanently deleted because historical orders reference it.',
      });
    }

    await ProductVariant.deleteMany({ productId: product._id });
    await product.deleteOne();

    await logAudit(req, 'DELETE_PRODUCT', 'Product', req.params.id);
    res.json({ success: true, message: 'Product and variants deleted permanently' });
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

    await variant.deleteOne();
    await logAudit(req, 'DELETE_VARIANT', 'ProductVariant', req.params.variantId);
    res.json({ success: true, message: 'Color variant deleted successfully' });
  } catch (error) {
    next(error);
  }
};
