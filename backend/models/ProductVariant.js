import mongoose from 'mongoose';

const sizeInventorySchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g., 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'
  stock: { type: Number, required: true, default: 0, min: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  sku: { type: String, uppercase: true, trim: true }, // sellable SKU, e.g. "CALZ-CLG-OAT-07"
  isAvailable: { type: Boolean, default: true },
});

const variantImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isMain: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const productVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    colorName: { type: String, required: true, trim: true }, // e.g. "Oat Beige", "Pitch Black"
    colorHex: { type: String, required: true, trim: true }, // e.g. "#E5DFC5", "#18181A"
    colorSwatchImage: { type: String },
    variantSku: { type: String, required: true, uppercase: true, trim: true, unique: true },
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    images: [variantImageSchema],
    sizes: [sizeInventorySchema],
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate total stock on the fly
productVariantSchema.virtual('totalStock').get(function () {
  if (!this.sizes || this.sizes.length === 0) return 0;
  return this.sizes.reduce((sum, item) => sum + (item.stock || 0), 0);
});

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
