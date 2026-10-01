const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getDashboard,
  getAppointments,
  getAppointmentById,
  approveAppointment,
  rejectAppointment,
  startSession,
  endSession,
  markNoShow,
  saveSessionNotes,
  handleUrgent,
  setOnlineMeeting,
  delaySession,
  rescheduleAppointment,
  getStudents,
  getStudentProfileAndHistory,
  getReports,
  exportReportCSV,
  getAnalytics,
  getNotificationLogs,
} = require('../controllers/counselorController');

const router = express.Router();

// Access Rule: All counselor routes use authMiddleware + roleMiddleware('counselor', 'admin')
router.use(authMiddleware, roleMiddleware('counselor', 'admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Appointments management
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/approve', approveAppointment);
router.patch('/appointments/:id/reject', rejectAppointment);
router.patch('/appointments/:id/start-session', startSession);
router.patch('/appointments/:id/end-session', endSession);
router.patch('/appointments/:id/no-show', markNoShow);
router.put('/appointments/:id/notes', saveSessionNotes);
router.patch('/appointments/:id/urgent', handleUrgent);
router.patch('/appointments/:id/online-meeting', setOnlineMeeting);
router.patch('/appointments/:id/delay', delaySession);
router.post('/appointments/:id/reschedule', rescheduleAppointment);

// Student directory & history
router.get('/students', getStudents);
router.get('/students/:id', getStudentProfileAndHistory);

// Reports
router.get('/reports', getReports);
router.get('/reports/export-csv', exportReportCSV);

// Analytics
router.get('/analytics', getAnalytics);

// Notification delivery log
router.get('/notifications/log', getNotificationLogs);

module.exports = router;
