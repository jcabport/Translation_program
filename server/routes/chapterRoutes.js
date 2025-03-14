const express = require('express');
const router = express.Router();
const {
  getChapterById,
  updateChapter,
  deleteChapter,
} = require('../controllers/chapterController');

// Chapter routes
router.route('/:id')
  .get(getChapterById)
  .put(updateChapter)
  .delete(deleteChapter);

module.exports = router;
