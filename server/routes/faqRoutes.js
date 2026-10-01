const express = require('express');
const { getFAQs } = require('../controllers/faqController');

const router = express.Router();

// GET /api/faqs (public)
router.get('/', getFAQs);

module.exports = router;
