import jwt from 'jsonwebtoken';
import { StoryPage } from '../models/StoryPage.js';
import { Product } from '../models/Product.js';
import { Collection } from '../models/Collection.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { logAudit } from '../utils/auditLogger.js';

// Helper to authenticate optional staff preview requests
const authenticatePreviewUser = async (req) => {
  try {
    if (req.user && ['admin', 'superadmin', 'editor'].includes(req.user.role)) {
      return req.user;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'calzare_super_secure_jwt_secret_dev_2026_xyz');
    if (!decoded?.id) return null;
    const user = await User.findById(decoded.id).select('role status');
    if (user && ['admin', 'superadmin', 'editor'].includes(user.role)) {
      return user;
    }
    return null;
  } catch (err) {
    return null;
  }
};

// Helper: Hydrate catalog products for Section E (Philosophy / Product Rail)
const hydrateSectionCatalog = async (section) => {
  if (section.sectionType !== 'philosophy' || !section.config?.showProductRail) {
    return section;
  }

  try {
    const limit = Math.min(Number(section.config?.maxRailProducts) || 6, 12);
    const source = section.config?.productRailSource || 'auto';
    let products = [];

    if (source === 'manual' && section.config?.manualProductIds?.length) {
      products = await Product.find({
        _id: { $in: section.config.manualProductIds },
        status: 'published',
      })
        .populate('variants')
        .populate('category', 'name slug')
        .limit(limit)
        .lean();
    } else if (source === 'collection' && section.config?.collectionSlug) {
      const coll = await Collection.findOne({ slug: section.config.collectionSlug, isPublished: true });
      if (coll) {
        if (coll.ruleType === 'price_under') {
          products = await Product.find({
            status: 'published',
            baseSalePrice: { $lte: Number(coll.ruleValue) || 999 },
          })
            .populate('variants')
            .populate('category', 'name slug')
            .limit(limit)
            .lean();
        } else if (coll.ruleType === 'manual' && coll.manualProductIds?.length) {
          products = await Product.find({
            _id: { $in: coll.manualProductIds },
            status: 'published',
          })
            .populate('variants')
            .populate('category', 'name slug')
            .limit(limit)
            .lean();
        } else {
          products = await Product.find({
            collections: coll._id,
            status: 'published',
          })
            .populate('variants')
            .populate('category', 'name slug')
            .limit(limit)
            .lean();
        }
      }
    } else if (source === 'category' && section.config?.categoryId) {
      products = await Product.find({
        category: section.config.categoryId,
        status: 'published',
      })
        .populate('variants')
        .populate('category', 'name slug')
        .limit(limit)
        .lean();
    } else {
      // Auto fallback: latest published products
      products = await Product.find({ status: 'published' })
        .sort({ isBestseller: -1, salesCount: -1, createdAt: -1 })
        .populate('variants')
        .populate('category', 'name slug')
        .limit(limit)
        .lean();
    }

    return {
      ...section,
      hydratedProducts: products,
    };
  } catch (err) {
    console.error('[StoryController] Error hydrating catalog products:', err);
    return {
      ...section,
      hydratedProducts: [],
    };
  }
};

/**
 * @desc Get public Our Story page content
 * @route GET /api/v1/story
 * @access Public (with staff draft preview support)
 */
export const getPublicStoryPage = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const isPreviewRequest = req.query.preview === 'true';

    let page = await StoryPage.findOne({ slug });

    if (!page) {
      // If no page exists yet, return unconfigured state without fake data
      return res.status(200).json({
        success: true,
        isConfigured: false,
        isPublished: false,
        page: null,
      });
    }

    // Check preview authentication
    let isPreview = false;
    if (isPreviewRequest) {
      const staffUser = await authenticatePreviewUser(req);
      if (staffUser) {
        isPreview = true;
      }
    }

    // If not in preview mode and page is not published, return unpublished response
    if (!isPreview && !page.isPublished) {
      return res.status(200).json({
        success: true,
        isConfigured: true,
        isPublished: false,
        isPreview: false,
        page: null,
      });
    }

    // Determine source sections: snapshot if published, or working draft if preview
    let rawSections = [];
    let pageMeta = {};

    if (isPreview) {
      rawSections = (page.sections || []).filter((s) => s.isEnabled !== false);
      pageMeta = {
        title: page.title,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        ogImage: page.ogImage,
      };
    } else {
      const snapshot = page.publishedSnapshot || {};
      rawSections = (snapshot.sections && snapshot.sections.length > 0 ? snapshot.sections : page.sections || [])
        .filter((s) => s.isEnabled !== false);
      pageMeta = {
        title: snapshot.title || page.title,
        slug: snapshot.slug || page.slug,
        metaTitle: snapshot.metaTitle || page.metaTitle,
        metaDescription: snapshot.metaDescription || page.metaDescription,
        ogImage: snapshot.ogImage || page.ogImage,
      };
    }

    // Sort by displayOrder
    rawSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Hydrate catalog dependencies
    const hydratedSections = await Promise.all(
      rawSections.map((sec) => hydrateSectionCatalog(sec.toObject ? sec.toObject() : sec))
    );

    return res.status(200).json({
      success: true,
      isConfigured: true,
      isPublished: page.isPublished,
      publishedAt: page.publishedAt,
      publishedVersion: page.publishedVersion,
      isPreview,
      page: {
        ...pageMeta,
        sections: hydratedSections,
      },
    });
  } catch (err) {
    console.error('[getPublicStoryPage] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving story page' });
  }
};

/**
 * @desc Get complete working draft & catalog options for Our Story Manager
 * @route GET /api/v1/story/admin
 * @access Admin/Staff
 */
export const adminGetStoryPage = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    let page = await StoryPage.findOne({ slug });

    // If not found, create an initial empty draft document (NO seeded fake content/stats)
    if (!page) {
      page = await StoryPage.create({
        slug,
        title: 'Our Story',
        metaTitle: 'Our Story — SolaWorld Footwear',
        metaDescription: 'Discover the story, craftsmanship, and design philosophy behind SolaWorld footwear.',
        isPublished: false,
        sections: [],
      });
    }

    // Fetch catalog references for editor dropdowns
    const [collections, categories, sampleProducts] = await Promise.all([
      Collection.find({ isPublished: true }).select('name slug ruleType').lean(),
      Category.find({ isActive: true }).select('name slug').lean(),
      Product.find({ status: 'published' }).select('title slug baseSalePrice baseOriginalPrice variants').limit(50).lean(),
    ]);

    return res.status(200).json({
      success: true,
      page,
      catalog: {
        collections: collections || [],
        categories: categories || [],
        products: sampleProducts || [],
      },
    });
  } catch (err) {
    console.error('[adminGetStoryPage] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching story manager data' });
  }
};

/**
 * @desc Update page metadata and full sections array in working draft
 * @route PUT /api/v1/story/admin
 * @access Admin/Staff
 */
export const adminUpdateStoryPage = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { title, metaTitle, metaDescription, ogImage, sections } = req.body;

    let page = await StoryPage.findOne({ slug });
    if (!page) {
      page = new StoryPage({ slug });
    }

    if (title !== undefined) page.title = title;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (ogImage !== undefined) page.ogImage = ogImage;
    if (Array.isArray(sections)) {
      page.sections = sections.map((sec, idx) => ({
        ...sec,
        displayOrder: idx,
      }));
    }

    page.lastUpdatedBy = req.user?._id;
    await page.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_STORY_DRAFT',
      entity: 'StoryPage',
      entityId: page._id,
      details: { slug, sectionCount: page.sections.length },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Story draft updated successfully',
      page,
    });
  } catch (err) {
    console.error('[adminUpdateStoryPage] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving story draft' });
  }
};

/**
 * @desc Add a new section to working draft
 * @route POST /api/v1/story/admin/sections
 * @access Admin/Staff
 */
export const adminAddSection = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { sectionType, title, config } = req.body;

    const allowedTypes = [
      'hero',
      'stats',
      'craftsmanship',
      'timeline',
      'philosophy',
      'manufacturing',
      'closing_statement',
    ];

    if (!allowedTypes.includes(sectionType)) {
      return res.status(400).json({ success: false, message: `Invalid section type: ${sectionType}` });
    }

    let page = await StoryPage.findOne({ slug });
    if (!page) {
      page = new StoryPage({ slug, sections: [] });
    }

    const uniqueId = `sec_${sectionType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSection = {
      sectionId: uniqueId,
      sectionType,
      title: title || `New ${sectionType.replace('_', ' ').toUpperCase()}`,
      isEnabled: true,
      displayOrder: page.sections.length,
      config: config || {},
    };

    page.sections.push(newSection);
    page.lastUpdatedBy = req.user?._id;
    await page.save();

    return res.status(201).json({
      success: true,
      message: 'Section added successfully',
      section: newSection,
      page,
    });
  } catch (err) {
    console.error('[adminAddSection] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error adding section' });
  }
};

/**
 * @desc Duplicate an existing section in draft
 * @route POST /api/v1/story/admin/sections/:sectionId/duplicate
 * @access Admin/Staff
 */
export const adminDuplicateSection = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { sectionId } = req.params;

    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    const sourceIdx = page.sections.findIndex((s) => s.sectionId === sectionId);
    if (sourceIdx === -1) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const source = page.sections[sourceIdx];
    const newSectionId = `sec_${source.sectionType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const duplicatedSection = {
      sectionId: newSectionId,
      sectionType: source.sectionType,
      title: `${source.title} (Copy)`,
      isEnabled: source.isEnabled,
      displayOrder: sourceIdx + 1,
      config: JSON.parse(JSON.stringify(source.config || {})),
    };

    page.sections.splice(sourceIdx + 1, 0, duplicatedSection);
    // Re-index displayOrder
    page.sections.forEach((sec, idx) => {
      sec.displayOrder = idx;
    });

    page.lastUpdatedBy = req.user?._id;
    await page.save();

    return res.status(200).json({
      success: true,
      message: 'Section duplicated',
      page,
    });
  } catch (err) {
    console.error('[adminDuplicateSection] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error duplicating section' });
  }
};

/**
 * @desc Delete a section from working draft
 * @route DELETE /api/v1/story/admin/sections/:sectionId
 * @access Admin/Staff
 */
export const adminDeleteSection = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { sectionId } = req.params;

    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    page.sections = page.sections.filter((s) => s.sectionId !== sectionId);
    page.sections.forEach((sec, idx) => {
      sec.displayOrder = idx;
    });

    page.lastUpdatedBy = req.user?._id;
    await page.save();

    return res.status(200).json({
      success: true,
      message: 'Section deleted',
      page,
    });
  } catch (err) {
    console.error('[adminDeleteSection] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting section' });
  }
};

/**
 * @desc Reorder sections in working draft
 * @route PUT /api/v1/story/admin/sections/reorder
 * @access Admin/Staff
 */
export const adminReorderSections = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array of sectionIds' });
    }

    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    const sectionMap = new Map();
    page.sections.forEach((sec) => sectionMap.set(sec.sectionId, sec));

    const reordered = [];
    orderedIds.forEach((id, idx) => {
      if (sectionMap.has(id)) {
        const sec = sectionMap.get(id);
        sec.displayOrder = idx;
        reordered.push(sec);
        sectionMap.delete(id);
      }
    });

    // Append any remaining sections
    sectionMap.forEach((sec) => {
      sec.displayOrder = reordered.length;
      reordered.push(sec);
    });

    page.sections = reordered;
    page.lastUpdatedBy = req.user?._id;
    await page.save();

    return res.status(200).json({
      success: true,
      message: 'Sections reordered successfully',
      page,
    });
  } catch (err) {
    console.error('[adminReorderSections] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error reordering sections' });
  }
};

/**
 * @desc Toggle a section's visibility in draft
 * @route PATCH /api/v1/story/admin/sections/:sectionId/toggle
 * @access Admin/Staff
 */
export const adminToggleSection = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const { sectionId } = req.params;

    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    const target = page.sections.find((s) => s.sectionId === sectionId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    target.isEnabled = !target.isEnabled;
    page.lastUpdatedBy = req.user?._id;
    await page.save();

    return res.status(200).json({
      success: true,
      message: `Section ${target.isEnabled ? 'enabled' : 'hidden'}`,
      page,
    });
  } catch (err) {
    console.error('[adminToggleSection] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error toggling section' });
  }
};

/**
 * @desc Publish the working draft to live storefront
 * @route POST /api/v1/story/admin/publish
 * @access Admin/Staff
 */
export const adminPublishStoryPage = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    // Snapshot draft into publishedSnapshot
    page.publishedSnapshot = {
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
      sections: JSON.parse(JSON.stringify(page.sections || [])),
      publishedAt: new Date(),
    };

    page.isPublished = true;
    page.publishedAt = new Date();
    page.publishedVersion = (page.publishedVersion || 0) + 1;
    page.lastUpdatedBy = req.user?._id;

    await page.save();

    await logAudit({
      user: req.user,
      action: 'PUBLISH_STORY_PAGE',
      entity: 'StoryPage',
      entityId: page._id,
      details: { slug, version: page.publishedVersion },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Story page published successfully (Version ${page.publishedVersion})`,
      page,
    });
  } catch (err) {
    console.error('[adminPublishStoryPage] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error publishing story page' });
  }
};

/**
 * @desc Unpublish the live story page
 * @route POST /api/v1/story/admin/unpublish
 * @access Admin/Staff
 */
export const adminUnpublishStoryPage = async (req, res) => {
  try {
    const slug = req.query.slug || 'about-us';
    const page = await StoryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Story page not found' });
    }

    page.isPublished = false;
    page.lastUpdatedBy = req.user?._id;
    await page.save();

    await logAudit({
      user: req.user,
      action: 'UNPUBLISH_STORY_PAGE',
      entity: 'StoryPage',
      entityId: page._id,
      details: { slug },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Story page unpublished from live storefront',
      page,
    });
  } catch (err) {
    console.error('[adminUnpublishStoryPage] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error unpublishing story page' });
  }
};
