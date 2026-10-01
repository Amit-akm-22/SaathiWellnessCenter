/**
 * Audit logging service.
 * Call auditService.log() from any admin mutation.
 */
const AuditLog = require('../models/AuditLog');

/**
 * Log an admin action.
 * @param {Object} options
 * @param {string|ObjectId} options.actorId
 * @param {string} options.actorRole
 * @param {string} options.action - e.g. 'USER_UPDATED'
 * @param {string} options.entityType - e.g. 'User'
 * @param {string|ObjectId} [options.entityId]
 * @param {Object} [options.before]
 * @param {Object} [options.after]
 * @param {Object} [options.meta] - extra context
 * @param {string} [options.ip]
 * @param {string} [options.userAgent]
 */
const log = async ({
  actorId,
  actorRole = 'admin',
  action,
  entityType,
  entityId = null,
  before = null,
  after = null,
  meta = null,
  ip = '',
  userAgent = '',
}) => {
  try {
    await AuditLog.create({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      before,
      after,
      meta,
      ip,
      userAgent,
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('[AuditLog] Failed to write audit entry:', err.message);
  }
};

/**
 * Extract IP and User-Agent from an Express request object.
 * @param {import('express').Request} req
 * @returns {{ ip: string, userAgent: string }}
 */
const fromReq = (req) => ({
  ip: req.ip || req.headers['x-forwarded-for'] || '',
  userAgent: req.headers['user-agent'] || '',
});

module.exports = { log, fromReq };
