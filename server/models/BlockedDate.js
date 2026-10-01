const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    slot: {
      type: String,
      default: null, // null = whole day blocked
    },
    reason: {
      type: String,
      required: true,
      maxlength: 300,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
blockedDateSchema.index({ date: 1, slot: 1 });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
