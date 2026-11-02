import { HomepageSection } from '../models/HomepageSection.js';
import { Product } from '../models/Product.js';
import { Collection } from '../models/Collection.js';
import { Review } from '../models/Review.js';
import { logAudit } from '../utils/auditLogger.js';

export const getPublishedHomepage = async (req, res, next) => {
  try {
    const now = new Date();
    // Query enabled sections, respecting optional start/end scheduling
    const sections = await HomepageSection.find({
      isEnabled: true,
      $and: [
        { $or: [{ scheduledStart: { $exists: false } }, { scheduledStart: null }, { scheduledStart: { $lte: now } }] },
        { $or: [{ scheduledEnd: { $exists: false } }, { scheduledEnd: null }, { scheduledEnd: { $gte: now } }] },
      ],
    })
      .sort({ displayOrder: 1 })
      .lean();

    // Hydrate dynamic data for specific section types
    const hydratedSections = await Promise.all(
      sections.map(async (sec) => {
        const item = { ...sec };

        // 1. Bestsellers or Product Grid
        if (sec.sectionType === 'bestsellers' || sec.sectionType === 'product_grid') {
          const limit = sec.config?.maxProducts || 8;
          let products = [];

          if (sec.config?.productSource === 'manual_select' && sec.config?.selectedProductIds?.length) {
            products = await Product.find({ _id: { $in: sec.config.selectedProductIds }, status: 'published' })
              .populate('variants')
              .populate('category', 'name slug');
          } else {
            // Auto-populated based on actual orders & salesCount
            products = await Product.find({ status: 'published' })
              .sort({ salesCount: -1, averageRating: -1, isBestseller: -1 })
              .limit(limit)
              .populate('variants')
              .populate('category', 'name slug');
          }
          item.dynamicProducts = products;
        }

        // 2. Affordable Collection / Price-based Storefront (e.g., ₹999 Store)
        if (sec.sectionType === 'affordable_store') {
          const cap = Number(sec.config?.priceCap) || 999;
          const limit = Number(sec.config?.maxProducts) || 8;
          let productQuery = {
            status: 'published',
          };

          // Manual product selection mode
          if (sec.config?.productSource === 'manual_select' && sec.config?.selectedProductIds?.length) {
            productQuery._id = { $in: sec.config.selectedProductIds };
          } else if (sec.config?.collectionSlug) {
            // Filter by collection if specified
            const matchedColl = await Collection.findOne({ slug: sec.config.collectionSlug, isPublished: true });
            if (matchedColl) {
              if (matchedColl.ruleType === 'price_under') {
                const collCap = Number(matchedColl.ruleValue) || cap;
                productQuery.baseSalePrice = { $lte: Math.min(cap, collCap) };
              } else if (matchedColl.ruleType === 'manual' && matchedColl.manualProductIds?.length) {
                productQuery._id = { $in: matchedColl.manualProductIds };
              } else {
                productQuery.collections = matchedColl._id;
              }
            } else {
              productQuery.baseSalePrice = { $lte: cap };
            }
          } else {
            productQuery.baseSalePrice = { $lte: cap };
          }

          // Sorting options
          const sortOption =
            sec.config?.sortBy === 'price_asc'
              ? { baseSalePrice: 1 }
              : sec.config?.sortBy === 'price_desc'
              ? { baseSalePrice: -1 }
              : sec.config?.sortBy === 'newest'
              ? { createdAt: -1 }
              : { baseSalePrice: 1, salesCount: -1 };

          let affordableProducts = await Product.find(productQuery)
            .sort(sortOption)
            .limit(limit)
            .populate('variants')
            .populate('category', 'name slug');

          // Fallback: If no products match the priceCap filter, load lowest-priced published products
          // so this section is NEVER empty when products exist in the store!
          if (!affordableProducts.length && (!sec.config?.productSource || sec.config?.productSource !== 'manual_select')) {
            affordableProducts = await Product.find({ status: 'published' })
              .sort({ baseSalePrice: 1 })
              .limit(limit)
              .populate('variants')
              .populate('category', 'name slug');
          }

          // If manual select, preserve admin specified order
          if (sec.config?.productSource === 'manual_select' && sec.config?.selectedProductIds?.length) {
            const idMap = new Map(affordableProducts.map((p) => [p._id.toString(), p]));
            affordableProducts = sec.config.selectedProductIds
              .map((id) => idMap.get(id?.toString() || id))
              .filter(Boolean);
          }

          if (sec.config?.productCutoutImages) {
            const cutouts = sec.config.productCutoutImages;
            affordableProducts = affordableProducts.map((p) => {
              const pObj = p.toObject ? p.toObject() : { ...p };
              const idStr = pObj._id?.toString();
              if (cutouts[idStr]) {
                pObj.cutoutImage = cutouts[idStr];
              }
              return pObj;
            });
          }

          item.dynamicProducts = affordableProducts;

          // Actual minimum price derived authoritatively from database or lowest product
          const minProduct = affordableProducts.length
            ? affordableProducts[0]
            : await Product.findOne({ status: 'published' })
                .sort({ baseSalePrice: 1 })
                .select('baseSalePrice');

          item.actualStartingPrice = minProduct
            ? minProduct.baseSalePrice
            : cap;
        }

        // 3. Customer Reviews Section
        if (sec.sectionType === 'reviews') {
          const source = sec.config?.reviewsSource || 'both';
          const curatedReviews = (sec.config?.customerReviews || [])
            .filter((r) => r.isEnabled !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          let dbReviews = [];
          if (source === 'auto_approved' || source === 'both') {
            dbReviews = await Review.find({ status: 'approved' })
              .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
              .limit(8)
              .populate('product', 'name slug defaultImages');
          }

          let combinedReviews = [];
          if (source === 'custom_curated') {
            combinedReviews = curatedReviews;
          } else if (source === 'auto_approved') {
            combinedReviews = dbReviews;
          } else {
            // 'both': curated custom words first, then approved customer submissions
            combinedReviews = [...curatedReviews, ...dbReviews];
          }

          item.dynamicReviews = combinedReviews;
        }

        return item;
      })
    );

    res.json({
      success: true,
      sections: hydratedSections,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Visual Editor APIs
export const adminGetAllSections = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find().sort({ displayOrder: 1 });
    res.json({ success: true, sections });
  } catch (error) {
    next(error);
  }
};

export const adminGetSectionById = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

export const adminCreateSection = async (req, res, next) => {
  try {
    const { sectionKey, sectionType, title, subtitle, eyebrow, displayOrder, isEnabled, config } = req.body;

    const count = await HomepageSection.countDocuments();
    const section = await HomepageSection.create({
      sectionKey: sectionKey || `section_${Date.now()}`,
      sectionType,
      title: title || '',
      subtitle: subtitle || '',
      eyebrow: eyebrow || '',
      displayOrder: displayOrder !== undefined ? displayOrder : count,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      config: config || {},
      lastUpdatedBy: req.user._id,
    });

    await logAudit(req, 'CREATE_HOMEPAGE_SECTION', 'HomepageSection', section._id, { sectionKey, sectionType });
    res.status(201).json({ success: true, section, message: 'Section created successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { title, subtitle, eyebrow, isEnabled, displayOrder, scheduledStart, scheduledEnd, config, publishDraft } = req.body;

    if (title !== undefined) section.title = title;
    if (subtitle !== undefined) section.subtitle = subtitle;
    if (eyebrow !== undefined) section.eyebrow = eyebrow;
    if (isEnabled !== undefined) section.isEnabled = isEnabled;
    if (displayOrder !== undefined) section.displayOrder = displayOrder;
    if (scheduledStart !== undefined) section.scheduledStart = scheduledStart;
    if (scheduledEnd !== undefined) section.scheduledEnd = scheduledEnd;

    if (config) {
      const existingConfig = section.config ? (section.config.toObject ? section.config.toObject() : section.config) : {};
      const mergedConfig = { ...existingConfig, ...config };
      for (const [k, v] of Object.entries(mergedConfig)) {
        if (v === undefined || v === 'undefined') {
          delete mergedConfig[k];
        }
      }
      section.config = mergedConfig;
    }

    section.publishedVersion = (section.publishedVersion || 1) + 1;
    section.lastUpdatedBy = req.user._id;

    await section.save();
    await logAudit(req, 'UPDATE_HOMEPAGE_SECTION', 'HomepageSection', section._id, { sectionKey: section.sectionKey });

    res.json({ success: true, section, message: 'Section updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminReorderSections = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // array of section IDs in new order
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' });
    }

    const updates = orderedIds.map((id, index) =>
      HomepageSection.findByIdAndUpdate(id, { displayOrder: index }, { new: true })
    );

    await Promise.all(updates);
    await logAudit(req, 'REORDER_HOMEPAGE_SECTIONS', 'HomepageSection', 'bulk', { count: orderedIds.length });

    const updatedSections = await HomepageSection.find().sort({ displayOrder: 1 });
    res.json({ success: true, sections: updatedSections, message: 'Sections reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminToggleSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    section.isEnabled = !section.isEnabled;
    await section.save();

    await logAudit(req, 'TOGGLE_HOMEPAGE_SECTION', 'HomepageSection', section._id, { isEnabled: section.isEnabled });
    res.json({ success: true, section, message: `Section ${section.isEnabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    await section.deleteOne();
    await logAudit(req, 'DELETE_HOMEPAGE_SECTION', 'HomepageSection', req.params.id);
    res.json({ success: true, message: 'Section removed successfully' });
  } catch (error) {
    next(error);
  }
};
