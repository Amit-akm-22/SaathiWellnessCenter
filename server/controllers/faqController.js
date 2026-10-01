const FAQ = require('../models/FAQ');

// @desc    Get all FAQs grouped by category
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search && search.trim()) {
      query = {
        $or: [
          { question: { $regex: search.trim(), $options: 'i' } },
          { answer: { $regex: search.trim(), $options: 'i' } },
        ],
      };
    }

    const faqs = await FAQ.find(query).sort({ category: 1, order: 1 });

    // Group by category
    const grouped = {};
    faqs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });

    res.status(200).json({
      success: true,
      data: { faqs: grouped },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFAQs };
