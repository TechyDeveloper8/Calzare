import mongoose from 'mongoose';

const supportInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['order_status', 'sizing_fit', 'exchange_return', 'product_inquiry', 'general'],
      default: 'general',
      index: true,
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

export const SupportInquiry = mongoose.model('SupportInquiry', supportInquirySchema);
