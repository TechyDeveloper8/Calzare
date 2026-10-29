import mongoose from 'mongoose';

const storySectionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: String,
      required: true,
      trim: true,
    },
    sectionType: {
      type: String,
      required: true,
      enum: [
        'hero',
        'stats',
        'craftsmanship',
        'timeline',
        'philosophy',
        'manufacturing',
        'closing_statement',
      ],
    },
    title: { type: String, default: '' },
    isEnabled: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const storyPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: 'about-us',
      index: true,
    },
    title: {
      type: String,
      default: 'Our Story',
      trim: true,
    },
    metaTitle: {
      type: String,
      default: 'Our Story — CALZARE Footwear',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: 'Discover the story, craftsmanship, and design philosophy behind CALZARE footwear.',
      trim: true,
    },
    ogImage: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    publishedVersion: {
      type: Number,
      default: 0,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Working draft sections
    sections: [storySectionSchema],
    // Snapshot of published sections and metadata
    publishedSnapshot: {
      title: { type: String },
      slug: { type: String },
      metaTitle: { type: String },
      metaDescription: { type: String },
      ogImage: { type: String },
      sections: [storySectionSchema],
      publishedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const StoryPage = mongoose.model('StoryPage', storyPageSchema);
