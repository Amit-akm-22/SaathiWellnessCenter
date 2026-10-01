const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_approved',
        'appointment_rejected',
        'appointment_cancelled',
        'appointment_completed',
        'appointment_rescheduled',
        'appointment_delayed',
        'meeting_link_shared',
        'feedback_reminder',
        'urgent_alert',
        'general',
      ],
      default: 'general',
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
