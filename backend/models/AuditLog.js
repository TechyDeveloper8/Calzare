import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true }, // e.g., 'UPDATE_HOMEPAGE', 'UPDATE_PRODUCT_VARIANT', 'REFUND_ORDER'
    entityType: { type: String, required: true }, // 'HomepageSection', 'Product', 'Order', etc.
    entityId: { type: String },
    details: { type: Object },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
