/**
 * Appointment state machine transition rules.
 * Enforces valid lifecycle states across counselor and student modules.
 */

const ALLOWED_TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['in_progress', 'rescheduled', 'cancelled', 'no_show'],
  in_progress: ['completed'],
  rescheduled: ['approved', 'in_progress', 'cancelled', 'no_show', 'rescheduled'],
  completed: [],
  rejected: [],
  cancelled: [],
  no_show: [],
};

/**
 * Checks if a transition from currentStatus to nextStatus is permissible.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
const canTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true; // idempotent
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

/**
 * Throws or returns an error message if transition is invalid.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 */
const validateTransition = (currentStatus, nextStatus) => {
  if (!canTransition(currentStatus, nextStatus)) {
    const error = new Error(
      `Invalid appointment status transition from '${currentStatus}' to '${nextStatus}'. Allowed next states: [${(ALLOWED_TRANSITIONS[currentStatus] || []).join(', ')}]`
    );
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransition,
  validateTransition,
};
