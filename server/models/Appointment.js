const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Snapshot fields from the student's record at booking time
    name: { type: String, required: true },
    email: { type: String, required: true },
    enrollmentNo: { type: String, required: true },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      enum: ['1st', '2nd', '3rd', '4th'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: [
        '10:00-10:45',
        '11:00-11:45',
        '12:00-12:45',
        '14:00-14:45',
        '15:00-15:45',
        '16:00-16:45',
      ],
    },
    issueCategory: {
      type: String,
      required: true,
      enum: [
        'Academic Stress',
        'Anxiety / Panic',
        'Depression / Low Mood',
        'Relationship / Heartbreak',
        'Loneliness / Social Issues',
        'Anger / Mood Swings',
        'Family Issues',
        'Career Confusion',
        'Other',
      ],
    },
    customCategory: {
      type: String,
      maxlength: 200,
      default: '',
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },

    // Screening data
    screeningAnswers: {
      type: [Number],
      default: [],
    },
    screeningScore: {
      type: Number,
      default: 0,
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', ''],
      default: '',
    },
    urgentFlag: {
      type: Boolean,
      default: false,
    },

    // Status management
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled',
        'rescheduled',
        'no_show',
      ],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },

    // Session tracking
    sessionStartedAt: {
      type: Date,
      default: null,
    },
    sessionEndedAt: {
      type: Date,
      default: null,
    },
    actualDurationMins: {
      type: Number,
      default: 0,
    },

    // Overrun / Delay tracking
    delayMinutes: {
      type: Number,
      default: 0,
    },
    delayNotifiedAt: {
      type: Date,
      default: null,
    },
    delayMessage: {
      type: String,
      default: '',
    },

    // Reschedule history
    rescheduleHistory: [
      {
        oldDate: { type: Date },
        oldSlot: { type: String },
        newDate: { type: Date },
        newSlot: { type: String },
        reason: { type: String, default: '' },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],

    // Counselor assignment & meeting mode
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    meetingMode: {
      type: String,
      enum: ['offline', 'online', ''],
      default: 'offline',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    meeting: {
      mode: {
        type: String,
        enum: ['offline', 'online', ''],
        default: 'offline',
      },
      link: {
        type: String,
        default: '',
      },
      provider: {
        type: String,
        enum: ['google_meet', 'manual', ''],
        default: '',
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },

    // Session Notes
    sessionNotes: {
      summary: { type: String, default: '' },
      advice: { type: String, default: '' },
      followUpNeeded: { type: Boolean, default: false },
      followUpDate: { type: Date, default: null },
      forwarded: { type: Boolean, default: false },
      forwardedTo: { type: String, default: '' },
      forwardedReason: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    },

    // Student feedback
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 300 },
      wasHelpful: { type: Boolean },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slot clash queries
appointmentSchema.index({ date: 1, timeSlot: 1, status: 1 });
// Index for student's appointment history
appointmentSchema.index({ studentId: 1, createdAt: -1 });
// Filter indexes for counselor reporting and analytics
appointmentSchema.index({ status: 1, severity: 1, date: 1 });
appointmentSchema.index({ date: 1, branch: 1, year: 1, gender: 1 });
appointmentSchema.index({ issueCategory: 1, severity: 1 });
appointmentSchema.index({ isUrgent: 1, urgentFlag: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
