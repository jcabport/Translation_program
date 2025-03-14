const { Chapter, Novel, DetectedName } = require('../models');
const TranslationService = require('../services/translationService');
const NameManager = require('../services/nameManager');

// Initialize services
if (!process.env.CLAUDE_API_KEY) {
  console.error('CLAUDE_API_KEY is not set in environment variables');
  process.exit(1);
}

const nameManager = new NameManager(process.env.CLAUDE_API_KEY);
const translationService = new TranslationService(process.env.CLAUDE_API_KEY, nameManager);

// @desc    Translate a chapter
// @route   POST /api/novels/:novelId/chapters/:chapterId/translate
// @access  Public
const translateChapter = async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    
    // Validate parameters
    if (!novelId || !chapterId) {
      return res.status(400).json({
        message: 'Novel ID and Chapter ID are required'
      });
    }

    // Check if Claude API key is configured
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set in environment variables');
      return res.status(500).json({
        message: 'Translation service is not properly configured. Please check your API settings.'
      });
    }

    // Get the chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found'
      });
    }

    // Check if chapter belongs to the specified novel
    if (chapter.novel.toString() !== novelId) {
      return res.status(400).json({
        message: 'Chapter does not belong to the specified novel'
      });
    }

    // Translate the chapter
    const result = await translationService.translateChapter(
      novelId,
      chapterId,
      chapter.sourceText
    );

    // Update chapter with translation
    chapter.translation = {
      raw: result.rawTranslation,
      processed: result.processedTranslation,
      createdAt: new Date()
    };
    chapter.status = 'translated';

    // Generate and save chapter summary
    const summary = await translationService.generateChapterSummary(
      novelId,
      chapterId,
      result.processedTranslation
    );
    chapter.summary = summary;

    await chapter.save();

    res.json({
      message: 'Chapter translated successfully',
      chapter
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      message: error.message || 'Translation failed. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

module.exports = {
  translateChapter
};
