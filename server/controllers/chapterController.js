const { Novel, Chapter } = require('../models');

// @desc    Get all chapters for a novel
// @route   GET /api/novels/:novelId/chapters
// @access  Public
const getChapters = async (req, res) => {
  try {
    // Special case for "new" route
    if (req.params.novelId === 'new') {
      return res.json([]);
    }
    
    const chapters = await Chapter.find({ novel: req.params.novelId })
      .sort({ number: 1 });
    
    res.json(chapters);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error: ' + error.message);
  }
};

// @desc    Get a chapter by ID
// @route   GET /api/chapters/:id
// @access  Public
const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (chapter) {
      res.json(chapter);
    } else {
      res.status(404);
      throw new Error('Chapter not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Create a new chapter
// @route   POST /api/novels/:novelId/chapters
// @access  Public
const createChapter = async (req, res) => {
  try {
    const { number, title, sourceText } = req.body;
    const novelId = req.params.novelId;
    
    // Check if novel exists
    const novel = await Novel.findById(novelId);
    if (!novel) {
      res.status(404);
      throw new Error('Novel not found');
    }
    
    // Check if chapter number already exists for this novel
    const existingChapter = await Chapter.findOne({ novel: novelId, number });
    if (existingChapter) {
      res.status(400);
      throw new Error(`Chapter ${number} already exists for this novel`);
    }
    
    const chapter = await Chapter.create({
      novel: novelId,
      number,
      title,
      sourceText,
      status: 'pending',
    });
    
    // Add chapter to novel's chapters array
    novel.chapters.push(chapter._id);
    await novel.save();
    
    res.status(201).json(chapter);
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    throw new Error('Invalid chapter data: ' + error.message);
  }
};

// @desc    Update a chapter
// @route   PUT /api/chapters/:id
// @access  Public
const updateChapter = async (req, res) => {
  try {
    const { number, title, sourceText } = req.body;
    
    const chapter = await Chapter.findById(req.params.id);
    
    if (chapter) {
      // If changing chapter number, check if it already exists
      if (number && number !== chapter.number) {
        const existingChapter = await Chapter.findOne({ 
          novel: chapter.novel, 
          number,
          _id: { $ne: chapter._id } // Exclude current chapter
        });
        
        if (existingChapter) {
          res.status(400);
          throw new Error(`Chapter ${number} already exists for this novel`);
        }
      }
      
      chapter.number = number || chapter.number;
      chapter.title = title || chapter.title;
      chapter.sourceText = sourceText || chapter.sourceText;
      
      // If source text is updated, reset translation status
      if (sourceText && sourceText !== chapter.sourceText) {
        chapter.status = 'pending';
        chapter.translation = {
          raw: null,
          processed: null,
          createdAt: null,
        };
      }
      
      const updatedChapter = await chapter.save();
      res.json(updatedChapter);
    } else {
      res.status(404);
      throw new Error('Chapter not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Public
const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (chapter) {
      // Remove chapter from novel's chapters array
      await Novel.updateOne(
        { _id: chapter.novel },
        { $pull: { chapters: chapter._id } }
      );
      
      // Delete the chapter
      await chapter.remove();
      res.json({ message: 'Chapter removed' });
    } else {
      res.status(404);
      throw new Error('Chapter not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

module.exports = {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};
