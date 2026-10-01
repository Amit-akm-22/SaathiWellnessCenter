/**
 * Cached settings loader.
 * Reads from the DB Settings document. Falls back to default if not seeded yet.
 * Cache is invalidated on every update via invalidateCache().
 */
const Settings = require('../models/Settings');

let cache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Get the current settings. Cached for 1 minute.
 * @returns {Promise<Object>}
 */
const getSettings = async () => {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL_MS) {
    return cache;
  }

  let settings = await Settings.findOne({ _singleton: 'global' }).lean();
  if (!settings) {
    // Upsert defaults on first call
    const S = require('../models/Settings');
    settings = await S.findOneAndUpdate(
      { _singleton: 'global' },
      { $setOnInsert: { ...S.defaultSettings, _singleton: 'global' } },
      { upsert: true, new: true }
    ).lean();
  }

  cache = settings;
  cacheTime = now;
  return cache;
};

/**
 * Invalidate the in-memory cache so the next call re-reads from DB.
 */
const invalidateCache = () => {
  cache = null;
  cacheTime = 0;
};

/**
 * Get active time slot strings (e.g. "10:00-10:45") from Settings.
 * @returns {Promise<string[]>}
 */
const getActiveSlotStrings = async () => {
  const s = await getSettings();
  return s.slots
    .filter((sl) => sl.isActive)
    .map((sl) => `${sl.start}-${sl.end}`);
};

/**
 * Get active issue category labels from Settings.
 * @returns {Promise<string[]>}
 */
const getActiveCategoryLabels = async () => {
  const s = await getSettings();
  return s.issueCategories.filter((c) => c.isActive).map((c) => c.label);
};

/**
 * Calculate screening score and severity using DB-driven thresholds.
 * @param {number[]} answers
 * @returns {Promise<{score: number, severity: string, urgentFlag: boolean}>}
 */
const calculateScreeningWithSettings = async (answers) => {
  const s = await getSettings();
  const activeQuestions = s.screeningQuestions
    .filter((q) => q.isActive)
    .sort((a, b) => a.order - b.order);

  if (!Array.isArray(answers) || answers.length !== activeQuestions.length) {
    return { score: 0, severity: '', urgentFlag: false };
  }

  for (const a of answers) {
    if (typeof a !== 'number' || a < 0 || a > 3) {
      return { score: 0, severity: '', urgentFlag: false };
    }
  }

  // Safety question is any question with isSafetyQuestion = true
  const safetyIdx = activeQuestions.findIndex((q) => q.isSafetyQuestion);
  const urgentFlag = safetyIdx >= 0 && answers[safetyIdx] > 0;

  // Score = sum of non-safety questions
  let score = 0;
  activeQuestions.forEach((q, idx) => {
    if (!q.isSafetyQuestion) score += answers[idx];
  });

  let severity;
  if (urgentFlag) {
    severity = 'Severe';
  } else if (score <= s.severityThresholds.mildMax) {
    severity = 'Mild';
  } else if (score <= s.severityThresholds.moderateMax) {
    severity = 'Moderate';
  } else {
    severity = 'Severe';
  }

  return { score, severity, urgentFlag };
};

module.exports = {
  getSettings,
  invalidateCache,
  getActiveSlotStrings,
  getActiveCategoryLabels,
  calculateScreeningWithSettings,
};
