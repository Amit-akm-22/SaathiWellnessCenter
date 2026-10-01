const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAvailableSlots } = require('../controllers/studentController');

const router = express.Router();

// GET /api/slots?date=YYYY-MM-DD (authenticated)
router.get('/', authMiddleware, getAvailableSlots);

module.exports = router;
