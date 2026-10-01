// Time slot configuration - single source of truth
// 45-minute sessions with 15-minute buffers
const TIME_SLOTS = [
  '10:00-10:45',
  '11:00-11:45',
  '12:00-12:45',
  '14:00-14:45',
  '15:00-15:45',
  '16:00-16:45',
];

const MAX_BOOKINGS_PER_SLOT = 2;

const ISSUE_CATEGORIES = [
  'Academic Stress',
  'Anxiety / Panic',
  'Depression / Low Mood',
  'Relationship / Heartbreak',
  'Loneliness / Social Issues',
  'Anger / Mood Swings',
  'Family Issues',
  'Career Confusion',
  'Other',
];

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'Mechanical', 'Civil', 'Other'];
const YEARS = ['1st', '2nd', '3rd', '4th'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

module.exports = {
  TIME_SLOTS,
  MAX_BOOKINGS_PER_SLOT,
  ISSUE_CATEGORIES,
  BRANCHES,
  YEARS,
  GENDERS,
};
