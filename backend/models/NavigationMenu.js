import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  isExternal: { type: Boolean, default: false },
  badge: { type: String }, // e.g. "HOT", "NEW", "₹999"
  icon: { type: String },
  displayOrder: { type: Number, default: 0 },
  children: [
    {
      label: { type: String, required: true },
      url: { type: String, required: true },
      badge: { type: String },
    },
  ],
});

const navigationMenuSchema = new mongoose.Schema(
  {
    menuKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['header', 'announcement_bar', 'footer_shop', 'footer_help', 'footer_about', 'mobile'],
      index: true,
    },
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    items: [menuItemSchema],
    metadata: {
      announcementRotating: { type: Boolean, default: true },
      rotationIntervalSec: { type: Number, default: 4 },
      bgColor: { type: String, default: '#0f0f10' },
      textColor: { type: String, default: '#ffffff' },
      stickyHeader: { type: Boolean, default: true },
      logoUrl: { type: String, default: '' },
      logoText: { type: String, default: 'CALZARE' },
    },
  },
  { timestamps: true }
);

export const NavigationMenu = mongoose.model('NavigationMenu', navigationMenuSchema);
