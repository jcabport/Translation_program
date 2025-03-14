const express = require('express');
const router = express.Router();
const { translateChapter } = require('../controllers/translationController');

// Translation routes
router.post('/novels/:novelId/chapters/:chapterId/translate', translateChapter);

module.exports = router; 