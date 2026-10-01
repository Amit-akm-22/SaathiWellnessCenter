const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

module.exports = router;
