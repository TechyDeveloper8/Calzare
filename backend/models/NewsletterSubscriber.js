import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
      index: true,
    },
    consentGiven: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'homepage_footer' },
  },
  { timestamps: true }
);

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
