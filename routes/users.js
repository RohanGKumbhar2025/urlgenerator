// router/users.js
const express = require('express');
const router = express.Router();
const { handleGenerateNewShortUrl, handleAnalytics, handleVisitHistory } = require('../controller/url');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

router.post('/', handleGenerateNewShortUrl);
router.get('/analytics/:shortUrl', handleAnalytics);
router.get('/history/:shortUrl', handleVisitHistory);

module.exports = router;