import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  productName: { type: String, required: true },
  productSlug: { type: String, required: true },
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  image: { type: String, required: true },
  unitPrice: { type: Number, required: true }, // Snapshotted regular or sale price at purchase
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const timelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String, lowercase: true, trim: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    items: [orderItemSnapshotSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponApplied: {
      code: { type: String },
      discountType: { type: String },
      discountValue: { type: Number },
    },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentDetails: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
    },

    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled'],
      default: 'unfulfilled',
    },
    trackingInfo: {
      courierName: { type: String },
      carrier: { type: String },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    notes: { type: String },
    timeline: [timelineEventSchema],
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
