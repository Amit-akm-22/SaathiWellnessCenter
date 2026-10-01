const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  restoreUser,
  changeOwnPassword,
  importCSV,
  getAppointments,
  overrideAppointment,
  deleteAppointment,
  moderateFeedback,
  recalculateCapacity,
  getSettingsRoute,
  updateSettings,
  testNotification,
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAuditLogs,
  getNotificationLogs,
  retryNotification,
  exportData,
  getAnnouncement,
} = require('../controllers/adminController');

const router = express.Router();

// Public announcement route
router.get('/announcement', getAnnouncement);

// All admin routes below require admin role
router.use(authMiddleware, roleMiddleware('admin'));

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', getUsers);
router.post('/users', createUser);
router.post('/users/import-csv', importCSV);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.post('/users/:id/reset-password', resetPassword);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/restore', restoreUser);
router.post('/change-password', changeOwnPassword);

// ─── Appointment Override ─────────────────────────────────────────────────────
router.get('/appointments', getAppointments);
router.put('/appointments/:id', overrideAppointment);
router.delete('/appointments/:id', deleteAppointment);
router.patch('/appointments/:id/feedback', moderateFeedback);

// ─── Slot Capacity ─────────────────────────────────────────────────────────
router.post('/slots/recalculate', recalculateCapacity);

// ─── System Settings ──────────────────────────────────────────────────────────
router.get('/settings', getSettingsRoute);
router.put('/settings', updateSettings);
router.post('/settings/test-notification', testNotification);

// ─── Blocked Dates ────────────────────────────────────────────────────────────
router.get('/blocked-dates', getBlockedDates);
router.post('/blocked-dates', addBlockedDate);
router.delete('/blocked-dates/:id', removeBlockedDate);

// ─── Content Management ───────────────────────────────────────────────────────
router.get('/faqs', getFAQs);
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

// ─── Audit & Notification Logs ────────────────────────────────────────────────
router.get('/audit-logs', getAuditLogs);
router.get('/notification-logs', getNotificationLogs);
router.post('/notification-logs/:id/retry', retryNotification);

// ─── Data Export ─────────────────────────────────────────────────────────────
router.get('/export/:type', exportData);

module.exports = router;
