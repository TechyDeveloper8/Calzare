import { CMSPage } from '../models/CMSPage.js';
import { SupportInquiry } from '../models/SupportInquiry.js';
import slugify from 'slugify';
import { logAudit } from '../utils/auditLogger.js';

export const getPageBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slugAliases = {
      'terms-and-conditions': ['terms', 'terms-and-conditions'],
      'terms': ['terms', 'terms-and-conditions'],
      'privacy-policy': ['privacy', 'privacy-policy'],
      'privacy': ['privacy', 'privacy-policy'],
      'shipping-policy': ['shipping', 'shipping-policy'],
      'shipping': ['shipping', 'shipping-policy'],
      'return-exchange-policy': ['returns', 'return-exchange-policy'],
      'returns': ['returns', 'return-exchange-policy'],
    };

    const targetSlugs = slugAliases[rawSlug] || [rawSlug];
    const page = await CMSPage.findOne({ slug: { $in: targetSlugs }, isPublished: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

export const getJournalArticles = async (req, res, next) => {
  try {
    const articles = await CMSPage.find({ category: 'journal', isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

export const getJournalArticleBySlug = async (req, res, next) => {
  try {
    const article = await CMSPage.findOne({ slug: req.params.slug, category: 'journal', isPublished: true });
    if (!article) return res.status(404).json({ success: false, message: 'Journal article not found' });
    res.json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

export const submitContactInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, category, orderNumber, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const inquiry = await SupportInquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      category: category || 'general',
      orderNumber: orderNumber ? orderNumber.trim().toUpperCase() : undefined,
      subject: subject ? subject.trim() : `Support Inquiry from ${name.trim()}`,
      message: message.trim(),
      ipAddress: req.ip || req.connection?.remoteAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been submitted and assigned reference ID #' + inquiry._id.toString().slice(-6).toUpperCase() + '. Our concierge team will get back to you shortly.',
      inquiryId: inquiry._id,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetInquiries = async (req, res, next) => {
  try {
    const inquiries = await SupportInquiry.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, inquiries });
  } catch (error) {
    next(error);
  }
};

export const adminGetPages = async (req, res, next) => {
  try {
    const pages = await CMSPage.find().sort({ createdAt: -1 });
    res.json({ success: true, pages });
  } catch (error) {
    next(error);
  }
};

export const adminCreatePage = async (req, res, next) => {
  try {
    const { title, slug, content, excerpt, category, heroImage, author, readTime, tags, isPublished, metaTitle, metaDescription } = req.body;
    const cleanSlug = slugify(slug || title, { lower: true, strict: true });

    const page = await CMSPage.create({
      title,
      slug: cleanSlug,
      content,
      excerpt,
      category: category || 'info',
      heroImage,
      author: author || 'CALZARE Editorial',
      readTime: readTime || '3 min read',
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      metaTitle: metaTitle || title,
      metaDescription,
    });

    await logAudit(req, 'CREATE_CMS_PAGE', 'CMSPage', page._id, { title, slug: cleanSlug });
    res.status(201).json({ success: true, page, message: 'Page created successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdatePage = async (req, res, next) => {
  try {
    const page = await CMSPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const fields = ['title', 'content', 'excerpt', 'category', 'heroImage', 'author', 'readTime', 'tags', 'isPublished', 'metaTitle', 'metaDescription'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) page[f] = req.body[f];
    });

    if (req.body.slug) {
      page.slug = slugify(req.body.slug, { lower: true, strict: true });
    }

    await page.save();
    await logAudit(req, 'UPDATE_CMS_PAGE', 'CMSPage', page._id, { title: page.title });
    res.json({ success: true, page, message: 'Page updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminDeletePage = async (req, res, next) => {
  try {
    const page = await CMSPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    await page.deleteOne();
    await logAudit(req, 'DELETE_CMS_PAGE', 'CMSPage', req.params.id);
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

