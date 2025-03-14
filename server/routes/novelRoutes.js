const express = require('express');
const router = express.Router();
const {
  getNovels,
  getNovelById,
  createNovel,
  updateNovel,
  deleteNovel,
} = require('../controllers/novelController');

const {
  getChapters,
  createChapter,
} = require('../controllers/chapterController');

const {
  getNameMappings,
  createNameMapping,
} = require('../controllers/nameController');

const {
  translateChapter,
} = require('../controllers/translationController');

// Novel routes
router.route('/')
  .get(getNovels)
  .post(createNovel);

// Special route for creating a new novel form
router.route('/new')
  .get((req, res) => {
    res.json({ message: 'New novel form' });
  });

router.route('/:id')
  .get(getNovelById)
  .put(updateNovel)
  .delete(deleteNovel);

// Chapter routes for a novel
router.route('/:novelId/chapters')
  .get(getChapters)
  .post(createChapter);

// Name mapping routes for a novel
router.route('/:novelId/names')
  .get(getNameMappings)
  .post(createNameMapping);

// Translation route for a chapter
router.route('/:novelId/chapters/:chapterId/translate')
  .post(translateChapter);

// Detected names routes
router.route('/:novelId/chapters/:chapterId/detected-names')
  .get(require('../controllers/nameController').getDetectedNames);

router.route('/:novelId/chapters/:chapterId/resolve-names')
  .put(require('../controllers/nameController').resolveDetectedNames);

module.exports = router;
