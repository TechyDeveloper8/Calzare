import { ProductVariant } from '../models/ProductVariant.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { logAudit } from '../utils/auditLogger.js';

export const getInventoryOverview = async (req, res, next) => {
  try {
    const lowStockThreshold = parseInt(req.query.threshold) || 5;

    const variants = await ProductVariant.find({ isActive: true })
      .populate('productId', 'name slug sku brand productType baseRegularPrice baseSalePrice defaultImages')
      .sort({ updatedAt: -1 });

    const inventoryRows = [];
    let totalStockUnits = 0;
    let lowStockCount = 0;

    variants.forEach((v) => {
      if (!v.productId) return;
      v.sizes.forEach((s) => {
        totalStockUnits += s.stock;
        const isLowStock = s.stock <= lowStockThreshold;
        if (isLowStock) lowStockCount++;

        inventoryRows.push({
          variantId: v._id,
          productId: v.productId._id,
          productName: v.productId.name,
          productSlug: v.productId.slug,
          productImage: v.images?.[0]?.url || v.productId.defaultImages?.[0]?.url || '',
          colorName: v.colorName,
          colorHex: v.colorHex,
          size: s.size,
          sku: s.sku || `${v.variantSku}-${s.size}`,
          stock: s.stock,
          salePrice: v.salePrice,
          isLowStock,
          isAvailable: s.isAvailable && s.stock > 0,
        });
      });
    });

    res.json({
      success: true,
      stats: {
        totalVariants: variants.length,
        totalSkus: inventoryRows.length,
        totalStockUnits,
        lowStockCount,
        threshold: lowStockThreshold,
      },
      inventory: inventoryRows,
    });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { variantId, size, newStock, changeQuantity, reason, note } = req.body;

    const variant = await ProductVariant.findById(variantId);
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

    const sizeEntry = variant.sizes.find((s) => s.size === size);
    if (!sizeEntry) return res.status(404).json({ success: false, message: `Size ${size} not found on this variant` });

    const prevStock = sizeEntry.stock;
    let calculatedNewStock = prevStock;
    let calculatedChange = 0;

    if (newStock !== undefined) {
      calculatedNewStock = Math.max(0, parseInt(newStock));
      calculatedChange = calculatedNewStock - prevStock;
    } else if (changeQuantity !== undefined) {
      calculatedChange = parseInt(changeQuantity);
      calculatedNewStock = Math.max(0, prevStock + calculatedChange);
    }

    sizeEntry.stock = calculatedNewStock;
    sizeEntry.isAvailable = calculatedNewStock > 0;
    await variant.save();

    const movement = await InventoryMovement.create({
      product: variant.productId,
      variant: variant._id,
      size,
      sku: sizeEntry.sku || `${variant.variantSku}-${size}`,
      changeQuantity: calculatedChange,
      previousStock: prevStock,
      newStock: calculatedNewStock,
      reason: reason || 'manual_adjustment',
      note: note || `Stock adjusted by ${req.user.name}`,
      performedBy: req.user._id,
    });

    await logAudit(req, 'ADJUST_INVENTORY', 'ProductVariant', variant._id, {
      size,
      prevStock,
      newStock: calculatedNewStock,
      reason,
    });

    res.json({
      success: true,
      sizeEntry,
      movement,
      message: `Stock for Size ${size} updated from ${prevStock} to ${calculatedNewStock}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryMovements = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const movements = await InventoryMovement.find()
      .populate('product', 'name slug')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, movements });
  } catch (error) {
    next(error);
  }
};
