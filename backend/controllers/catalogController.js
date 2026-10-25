import { Category } from '../models/Category.js';
import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import slugify from 'slugify';
import { logAudit } from '../utils/auditLogger.js';

// Categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const adminGetAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCategory = async (req, res, next) => {
  try {
    const { name, description, image, bannerImage, displayOrder, isActive, metaTitle, metaDescription } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      bannerImage,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      metaTitle: metaTitle || name,
      metaDescription,
    });

    await logAudit(req, 'CREATE_CATEGORY', 'Category', category._id, { name, slug });
    res.status(201).json({ success: true, category, message: 'Category created' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, description, image, bannerImage, displayOrder, isActive, metaTitle, metaDescription } = req.body;
    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (bannerImage !== undefined) category.bannerImage = bannerImage;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined) category.metaDescription = metaDescription;

    await category.save();
    await logAudit(req, 'UPDATE_CATEGORY', 'Category', category._id, { name: category.name });
    res.json({ success: true, category, message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check if products exist in category
    const count = await Product.countDocuments({ category: category._id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${count} products are currently assigned to it. Reassign products first.`,
      });
    }

    await category.deleteOne();
    await logAudit(req, 'DELETE_CATEGORY', 'Category', req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Collections
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ isPublished: true }).sort({ displayOrder: 1 });
    res.json({ success: true, collections });
  } catch (error) {
    next(error);
  }
};

export const getCollectionBySlug = async (req, res, next) => {
  try {
    const slug = (req.params.slug || '').toLowerCase();
    let collection = await Collection.findOne({ slug, isPublished: true });

    // Fallback preset metadata for audience collections if not yet persisted in database
    if (!collection) {
      if (slug === 'men') {
        collection = {
          name: "MEN'S FOOTWEAR EDIT",
          slug: 'men',
          description: 'Everyday comfort. Zero ordinary energy.',
          ruleType: 'audience_match',
          ruleValue: 'Men',
          hero: {
            label: "THE MEN'S EDIT",
            heading: 'BUILT TO STAND OUT.',
            supportingText: 'Everyday comfort. Zero ordinary energy.',
            desktopBannerUrl: '/images/split/men-collection-image.jpg',
            mobileBannerUrl: '',
            imagePosition: 'center center',
            background: 'editorial_minimal',
            ctaText: 'EXPLORE DROP',
            ctaLink: '#collection-grid',
            isVisible: true,
          },
          categoryShortcuts: [],
          editorialBanner: { isEnabled: false },
          seoTitle: "Men's Footwear | CALZARE",
          seoDescription: "Discover CALZARE Men's collection: ergonomic clogs, slides, and sandals engineered for all-day comfort and street-ready style.",
          isPublished: true,
        };
      } else if (slug === 'women') {
        collection = {
          name: "WOMEN'S FOOTWEAR EDIT",
          slug: 'women',
          description: 'Ultra-lightweight platform mules, pastel clogs, and ergonomic rebound slides crafted for effortless everyday street style.',
          ruleType: 'audience_match',
          ruleValue: 'Women',
          hero: {
            label: "THE WOMEN'S EDIT",
            heading: 'EFFORTLESS REBOUND.',
            supportingText: 'No laces, no rush — comfort that clocks off exactly when you do.',
            desktopBannerUrl: '/images/split/women-collection-image.jpg',
            mobileBannerUrl: '',
            imagePosition: 'center center',
            background: 'editorial_minimal',
            ctaText: 'EXPLORE DROP',
            ctaLink: '#collection-grid',
            isVisible: true,
          },
          categoryShortcuts: [],
          editorialBanner: { isEnabled: false },
          isPublished: true,
        };
      } else {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
    }

    let productQuery = { status: 'published' };
    if (collection.ruleType === 'price_under') {
      productQuery.baseSalePrice = { $lte: Number(collection.ruleValue) || 999 };
    } else if (collection.ruleType === 'manual' && collection.manualProductIds?.length) {
      productQuery._id = { $in: collection.manualProductIds };
    } else if (collection.ruleType === 'audience_match' || slug === 'men' || slug === 'women' || slug === 'kids' || slug === 'unisex') {
      const aud = collection.ruleValue || (slug.charAt(0).toUpperCase() + slug.slice(1));
      if (aud === 'Kids') productQuery.audience = 'Kids';
      else if (aud === 'Unisex') productQuery.audience = 'Unisex';
      else productQuery.audience = { $in: [aud, 'Unisex'] };
    } else if (collection._id) {
      productQuery.collections = collection._id;
    }

    const [products, allCategories] = await Promise.all([
      Product.find(productQuery)
        .populate('variants')
        .populate('category', 'name slug')
        .sort({ salesCount: -1, createdAt: -1 }),
      Category.find({ isActive: { $ne: false } }).sort({ displayOrder: 1 }),
    ]);

    res.json({
      success: true,
      collection,
      products,
      categories: allCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find().sort({ displayOrder: 1 });
    res.json({ success: true, collections });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCollection = async (req, res, next) => {
  try {
    const {
      name,
      description,
      heroMedia,
      bannerImage,
      displayOrder,
      isPublished,
      isFeaturedOnHome,
      ruleType,
      ruleValue,
      manualProductIds,
      hero,
      categoryShortcuts,
      editorialBanner,
      seoTitle,
      seoDescription,
      brandComparison,
    } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const collection = await Collection.create({
      name,
      slug,
      description,
      heroMedia: heroMedia || {},
      bannerImage,
      displayOrder: displayOrder || 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeaturedOnHome: !!isFeaturedOnHome,
      ruleType: ruleType || 'manual',
      ruleValue,
      manualProductIds: manualProductIds || [],
      hero: hero || {},
      categoryShortcuts: categoryShortcuts || [],
      editorialBanner: editorialBanner || {},
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description,
      brandComparison: brandComparison || {},
    });

    await logAudit(req, 'CREATE_COLLECTION', 'Collection', collection._id, { name, slug });
    res.status(201).json({ success: true, collection, message: 'Collection created successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    const fields = [
      'name',
      'description',
      'heroMedia',
      'bannerImage',
      'displayOrder',
      'isPublished',
      'isFeaturedOnHome',
      'ruleType',
      'ruleValue',
      'manualProductIds',
      'hero',
      'categoryShortcuts',
      'editorialBanner',
      'seoTitle',
      'seoDescription',
      'brandComparison',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) collection[f] = req.body[f];
    });

    if (req.body.name) {
      collection.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    await collection.save();
    await logAudit(req, 'UPDATE_COLLECTION', 'Collection', collection._id, { name: collection.name });
    res.json({ success: true, collection, message: 'Collection updated' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    await collection.deleteOne();
    await logAudit(req, 'DELETE_COLLECTION', 'Collection', req.params.id);
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    next(error);
  }
};
