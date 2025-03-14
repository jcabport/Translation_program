const { Chapter, Novel, DetectedName } = require('../models');
const TranslationService = require('../services/translationService');
const NameManager = require('../services/nameManager');

// Initialize services
const nameManager = new NameManager();
const translationService = new TranslationService(process.env.CLAUDE_API_KEY, nameManager);

// @desc    Translate a chapter
// @route   POST /api/novels/:novelId/chapters/:chapterId/translate
// @access  Public
const translateChapter = async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    
    // Get the chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      res.status(404);
      throw new Error('Chapter not found');
    }
    
    // Get the novel
    const novel = await Novel.findById(novelId);
    if (!novel) {
      res.status(404);
      throw new Error('Novel not found');
    }
    
    // Check if chapter belongs to novel
    if (chapter.novel.toString() !== novelId) {
      res.status(400);
      throw new Error('Chapter does not belong to this novel');
    }
    
    // Translate the chapter
    const result = await translationService.translateChapter(
      novelId,
      chapterId,
      chapter.sourceText,
      novel.sourceLanguage,
      novel.targetLanguage
    );
    
    // Update chapter with translation
    chapter.translation = {
      raw: result.rawTranslation,
      processed: result.processedTranslation,
      createdAt: new Date(),
    };
    
    // Update chapter status
    chapter.status = result.newNames.length > 0 ? 'needs_review' : 'translated';
    chapter.pendingNames = result.newNames.length > 0;
    
    await chapter.save();
    
    // Store detected names
    if (result.newNames.length > 0) {
      await Promise.all(result.newNames.map(async (name) => {
        await DetectedName.create({
          novel: novelId,
          chapter: chapterId,
          originalText: name.originalText,
          suggestedTranslation: name.suggestedTranslation,
          type: name.type || 'unknown',
          context: name.context,
          status: 'pending',
        });
      }));
    }
    
    // Generate chapter summary for future context
    if (!chapter.summary) {
      const summary = await translationService.generateChapterSummary(
        novelId,
        chapterId,
        result.processedTranslation
      );
      
      if (summary) {
        chapter.summary = summary;
        await chapter.save();
      }
    }
    
    res.json({
      translation: result.processedTranslation,
      newNames: result.newNames,
      needsReview: result.newNames.length > 0,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error('Translation failed: ' + error.message);
  }
};

module.exports = {
  translateChapter,
};
