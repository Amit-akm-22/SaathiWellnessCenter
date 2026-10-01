const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['student', 'counselor', 'admin', 'system'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. USER_CREATED, USER_UPDATED, USER_DELETED, USER_DEACTIVATED,
      //      ROLE_CHANGED, PASSWORD_RESET, APPOINTMENT_OVERRIDE,
      //      APPOINTMENT_STATUS_CHANGED, SETTINGS_CHANGED, FAQ_UPDATED,
      //      BLOCKED_DATE_ADDED, CAPACITY_RECALCULATED, CSV_IMPORT,
      //      FEEDBACK_MODERATED, NOTIFICATION_RETRY
      index: true,
    },
    entityType: {
      type: String,
      enum: ['User', 'Appointment', 'Settings', 'FAQ', 'BlockedDate', 'SlotCapacity', 'NotificationLog'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // extra context (e.g. reason, forceOverCapacity, notifyStudent)
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
