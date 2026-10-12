import { Coupon } from '../models/Coupon.js';
import { logAudit } from '../utils/auditLogger.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartSubtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please provide a coupon code' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return res.status(400).json({ success: false, message: 'Invalid or expired promotional code' });

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not yet active' });
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached' });
    }
    if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, cartSubtotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount,
        description: coupon.description,
      },
      message: `Coupon ${coupon.code} applied! Saved ₹${calculatedDiscount}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }],
    }).select('code description discountType discountValue minOrderValue maxDiscountAmount validUntil');
    res.json({ success: true, offers: coupons });
  } catch (error) {
    next(error);
  }
};

export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscountAmount, usageLimit, validFrom, validUntil, isActive } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount,
      usageLimit,
      validFrom: validFrom || new Date(),
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAudit(req, 'CREATE_COUPON', 'Coupon', coupon._id, { code: coupon.code });
    res.status(201).json({ success: true, coupon, message: 'Coupon created successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const fields = ['code', 'description', 'discountType', 'discountValue', 'minOrderValue', 'maxDiscountAmount', 'usageLimit', 'validFrom', 'validUntil', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === 'code') coupon.code = req.body.code.toUpperCase().trim();
        else coupon[f] = req.body[f];
      }
    });

    await coupon.save();
    await logAudit(req, 'UPDATE_COUPON', 'Coupon', coupon._id, { code: coupon.code });
    res.json({ success: true, coupon, message: 'Coupon updated' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    await coupon.deleteOne();
    await logAudit(req, 'DELETE_COUPON', 'Coupon', req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
