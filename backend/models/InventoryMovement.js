import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true, index: true },
    size: { type: String, required: true },
    sku: { type: String },
    changeQuantity: { type: Number, required: true }, // positive for restock, negative for deduction
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: ['order_placed', 'order_cancelled', 'manual_adjustment', 'restock_batch', 'damaged_loss', 'return_restock'],
      required: true,
      index: true,
    },
    referenceId: { type: String }, // e.g. orderNumber or batch id
    note: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
