import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async (req, action, entityType, entityId, details = {}) => {
  try {
    await AuditLog.create({
      performedBy: req.user ? req.user._id : null,
      userEmail: req.user ? req.user.email : 'system',
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};
