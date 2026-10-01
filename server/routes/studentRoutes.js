const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  submitFeedback,
  getDashboard,
  submitScreening,
  updateProfile,
} = require('../controllers/studentController');

const router = express.Router();

// All routes require auth + student role
router.use(authMiddleware, roleMiddleware('student'));

// GET /api/student/dashboard
router.get('/dashboard', getDashboard);

// PUT /api/student/profile
router.put('/profile', updateProfile);

// POST /api/student/screening
router.post('/screening', submitScreening);

// POST /api/student/appointments
router.post(
  '/appointments',
  [
    body('branch').notEmpty().withMessage('Branch is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
    body('issueCategory').notEmpty().withMessage('Issue category is required'),
    body('screeningAnswers')
      .isArray({ min: 5, max: 5 })
      .withMessage('5 screening answers are required'),
  ],
  bookAppointment
);

// GET /api/student/appointments
router.get('/appointments', getMyAppointments);

// GET /api/student/appointments/:id
router.get('/appointments/:id', getAppointmentById);

// PATCH /api/student/appointments/:id/cancel
router.patch('/appointments/:id/cancel', cancelAppointment);

// POST /api/student/appointments/:id/feedback
router.post(
  '/appointments/:id/feedback',
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Comment must be under 300 characters'),
  ],
  submitFeedback
);

module.exports = router;
