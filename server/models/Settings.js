const mongoose = require('mongoose');

// Default settings - mirrors config/constants.js and serves as seed data
const defaultSettings = {
  sessionDurationMins: 45,
  bufferMins: 15,
  slots: [
    { start: '10:00', end: '10:45', label: '10:00 - 10:45 AM', isActive: true },
    { start: '11:00', end: '11:45', label: '11:00 - 11:45 AM', isActive: true },
    { start: '12:00', end: '12:45', label: '12:00 - 12:45 PM', isActive: true },
    { start: '14:00', end: '14:45', label: '02:00 - 02:45 PM', isActive: true },
    { start: '15:00', end: '15:45', label: '03:00 - 03:45 PM', isActive: true },
    { start: '16:00', end: '16:45', label: '04:00 - 04:45 PM', isActive: true },
  ],
  maxBookingsPerSlot: 2,
  bookingWindowDays: 30,
  cancelCutoffHours: 2,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  maxActiveAppointmentsPerStudent: 1,
  issueCategories: [
    { label: 'Academic Stress', isActive: true },
    { label: 'Anxiety / Panic', isActive: true },
    { label: 'Depression / Low Mood', isActive: true },
    { label: 'Relationship / Heartbreak', isActive: true },
    { label: 'Loneliness / Social Issues', isActive: true },
    { label: 'Anger / Mood Swings', isActive: true },
    { label: 'Family Issues', isActive: true },
    { label: 'Career Confusion', isActive: true },
    { label: 'Other', isActive: true },
  ],
  screeningQuestions: [
    { text: 'Over the last 2 weeks, how often have you felt little interest or pleasure in doing things?', order: 1, isActive: true, isSafetyQuestion: false },
    { text: 'How often have you felt down, depressed, or hopeless?', order: 2, isActive: true, isSafetyQuestion: false },
    { text: 'How often have you had trouble falling or staying asleep, or sleeping too much?', order: 3, isActive: true, isSafetyQuestion: false },
    { text: 'How often have you felt tired or had little energy?', order: 4, isActive: true, isSafetyQuestion: false },
    { text: 'Have you had thoughts of hurting yourself or that you would be better off dead?', order: 5, isActive: true, isSafetyQuestion: true },
  ],
  severityThresholds: {
    mildMax: 4,
    moderateMax: 8,
  },
  helplineText: 'If you are in immediate distress, call our 24/7 helpline.',
  helplineNumber: '1800-599-0019',
  announcementBanner: {
    text: '',
    isActive: false,
  },
};

const settingsSchema = new mongoose.Schema(
  {
    // Single document - always use findOne() or getSettings() helper
    _singleton: { type: String, default: 'global', unique: true },
    sessionDurationMins: { type: Number, default: defaultSettings.sessionDurationMins },
    bufferMins: { type: Number, default: defaultSettings.bufferMins },
    slots: [
      {
        start: { type: String },
        end: { type: String },
        label: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
    maxBookingsPerSlot: { type: Number, default: defaultSettings.maxBookingsPerSlot },
    bookingWindowDays: { type: Number, default: defaultSettings.bookingWindowDays },
    cancelCutoffHours: { type: Number, default: defaultSettings.cancelCutoffHours },
    workingDays: [{ type: String }],
    maxActiveAppointmentsPerStudent: { type: Number, default: defaultSettings.maxActiveAppointmentsPerStudent },
    issueCategories: [
      {
        label: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
    screeningQuestions: [
      {
        text: { type: String },
        order: { type: Number },
        isActive: { type: Boolean, default: true },
        isSafetyQuestion: { type: Boolean, default: false },
      },
    ],
    severityThresholds: {
      mildMax: { type: Number, default: 4 },
      moderateMax: { type: Number, default: 8 },
    },
    helplineText: { type: String, default: defaultSettings.helplineText },
    helplineNumber: { type: String, default: defaultSettings.helplineNumber },
    announcementBanner: {
      text: { type: String, default: '' },
      isActive: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
module.exports.defaultSettings = defaultSettings;
