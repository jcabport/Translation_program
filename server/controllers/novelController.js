const { Novel, Chapter } = require('../models');

// @desc    Get all novels
// @route   GET /api/novels
// @access  Public
const getNovels = async (req, res) => {
  try {
    console.log('Attempting to fetch novels...');
    const novels = await Novel.find({}).sort({ createdAt: -1 });
    console.log(`Successfully fetched ${novels.length} novels`);
    res.json(novels);
  } catch (error) {
    console.error('Detailed error in getNovels:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return res.status(500).json({
      message: `Failed to fetch novels: ${error.message}`
    });
  }
};

// @desc    Get a novel by ID
// @route   GET /api/novels/:id
// @access  Public
const getNovelById = async (req, res) => {
  try {
    // Handle invalid IDs
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({
        message: 'Invalid novel ID'
      });
    }
    
    const novel = await Novel.findById(req.params.id).populate('chapters');
    
    if (novel) {
      res.json(novel);
    } else {
      return res.status(404).json({
        message: `Novel with ID ${req.params.id} not found`
      });
    }
  } catch (error) {
    console.error('Error fetching novel:', error);
    return res.status(500).json({
      message: `Failed to fetch novel: ${error.message}`
    });
  }
};

// @desc    Create a new novel
// @route   POST /api/novels
// @access  Public
const createNovel = async (req, res) => {
  try {
    const { title, author, sourceLanguage, targetLanguage, description, coverImage } = req.body;
    
    // Validate required fields
    if (!title || !author || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        message: 'Missing required fields: title, author, sourceLanguage, and targetLanguage are required'
      });
    }
    
    const novel = await Novel.create({
      title,
      author,
      sourceLanguage,
      targetLanguage,
      description,
      coverImage,
    });
    
    res.status(201).json(novel);
  } catch (error) {
    console.error('Error creating novel:', error);
    return res.status(400).json({
      message: `Failed to create novel: ${error.message}`
    });
  }
};

// @desc    Update a novel
// @route   PUT /api/novels/:id
// @access  Public
const updateNovel = async (req, res) => {
  try {
    const { title, author, sourceLanguage, targetLanguage, description, coverImage } = req.body;
    
    const novel = await Novel.findById(req.params.id);
    
    if (novel) {
      novel.title = title || novel.title;
      novel.author = author || novel.author;
      novel.sourceLanguage = sourceLanguage || novel.sourceLanguage;
      novel.targetLanguage = targetLanguage || novel.targetLanguage;
      novel.description = description || novel.description;
      novel.coverImage = coverImage || novel.coverImage;
      
      const updatedNovel = await novel.save();
      res.json(updatedNovel);
    } else {
      return res.status(404).json({
        message: 'Novel not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// @desc    Delete a novel
// @route   DELETE /api/novels/:id
// @access  Public
const deleteNovel = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    
    if (novel) {
      // Delete all chapters associated with this novel
      await Chapter.deleteMany({ novel: req.params.id });
      
      // Delete the novel
      await novel.remove();
      res.json({ message: 'Novel removed' });
    } else {
      return res.status(404).json({
        message: 'Novel not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getNovels,
  getNovelById,
  createNovel,
  updateNovel,
  deleteNovel,
};
