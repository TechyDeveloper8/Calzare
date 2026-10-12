import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true }, // for guest carts
    items: [cartItemSchema],
    couponCode: { type: String },
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
