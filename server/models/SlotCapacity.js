const mongoose = require('mongoose');

const slotCapacitySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// Unique compound index for atomic operations
slotCapacitySchema.index({ date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('SlotCapacity', slotCapacitySchema);
