export const detectBatchFromRoll = (rollNumber, degree = 'B.Tech') => {
  if (!rollNumber) return '';

  const cleanRoll = String(rollNumber).toUpperCase().trim();

  // Match 2-digit or 4-digit admission year in roll number
  // Examples: 0901CS211022 (21 -> 2021), BTCS24O1022 (24 -> 2024), 2023CS01 (2023)
  let startYear = null;

  const fourDigitMatch = cleanRoll.match(/(20[12]\d)/);
  if (fourDigitMatch) {
    startYear = parseInt(fourDigitMatch[1], 10);
  } else {
    // Try 2-digit year after letters, e.g. CS21 or BTCS24
    const twoDigitMatch = cleanRoll.match(/[A-Z]+(\d{2})/i) || cleanRoll.match(/\d{4}[A-Z]{2}(\d{2})/i);
    if (twoDigitMatch) {
      startYear = 2000 + parseInt(twoDigitMatch[1], 10);
    }
  }

  if (!startYear || isNaN(startYear) || startYear < 1990 || startYear > 2035) {
    return '';
  }

  // Duration in years by degree
  let duration = 4; // default B.Tech
  const deg = (degree || '').toLowerCase();
  if (deg.includes('arch')) {
    duration = 5;
  } else if (deg.includes('m.tech') || deg.includes('mca') || deg.includes('mba') || deg.includes('mup')) {
    duration = 2;
  } else if (deg.includes('phd')) {
    duration = 4;
  }

  const endYear = startYear + duration;
  return `${startYear}-${endYear}`;
};

export default {
  detectBatchFromRoll,
};
