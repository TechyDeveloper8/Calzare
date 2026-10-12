import { StoreSetting } from '../models/StoreSetting.js';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js';
import { AuditLog } from '../models/AuditLog.js';
import { logAudit } from '../utils/auditLogger.js';

export const getPublicSettings = async (req, res, next) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = await StoreSetting.create({});
    }

    res.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        businessAddress: settings.businessAddress,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        freeShippingThreshold: settings.freeShippingThreshold,
        defaultShippingFee: settings.defaultShippingFee,
        codEnabled: settings.codEnabled,
        codFee: settings.codFee,
        taxRatePercentage: settings.taxRatePercentage,
        razorpayKeyId: settings.razorpayKeyId,
        themeTokens: settings.themeTokens,
        googleAnalyticsId: settings.googleAnalyticsId,
        metaPixelId: settings.metaPixelId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetSettings = async (req, res, next) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = await StoreSetting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateSettings = async (req, res, next) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting();
    }

    const fields = [
      'storeName',
      'tagline',
      'contactEmail',
      'contactPhone',
      'businessAddress',
      'currency',
      'currencySymbol',
      'freeShippingThreshold',
      'defaultShippingFee',
      'codEnabled',
      'codFee',
      'taxRatePercentage',
      'razorpayEnabled',
      'razorpayKeyId',
      'themeTokens',
      'googleAnalyticsId',
      'metaPixelId',
      'googleSearchConsoleVerification',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) settings[f] = req.body[f];
    });

    await settings.save();
    await logAudit(req, 'UPDATE_SETTINGS', 'StoreSetting', settings._id, req.body);

    res.json({ success: true, settings, message: 'Store settings saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await NewsletterSubscriber.findOne({ email: cleanEmail });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return res.json({ success: true, message: 'You are already subscribed to CALZARE drops!' });
    }

    await NewsletterSubscriber.create({
      email: cleanEmail,
      consentGiven: true,
      source: source || 'storefront',
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to the club! You will receive our latest editorial drops.',
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetSubscribers = async (req, res, next) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (error) {
    next(error);
  }
};

export const adminGetAuditLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
