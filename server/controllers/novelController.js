const { Novel, Chapter } = require('../models');

// @desc    Get all novels
// @route   GET /api/novels
// @access  Public
const getNovels = async (req, res) => {
  try {
    const novels = await Novel.find({}).sort({ createdAt: -1 });
    res.json(novels);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error: ' + error.message);
  }
};

// @desc    Get a novel by ID
// @route   GET /api/novels/:id
// @access  Public
const getNovelById = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id).populate('chapters');
    
    if (novel) {
      res.json(novel);
    } else {
      res.status(404);
      throw new Error('Novel not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Create a new novel
// @route   POST /api/novels
// @access  Public
const createNovel = async (req, res) => {
  try {
    const { title, author, sourceLanguage, targetLanguage, description, coverImage } = req.body;
    
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
    res.status(400);
    throw new Error('Invalid novel data: ' + error.message);
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
      res.status(404);
      throw new Error('Novel not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
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
      res.status(404);
      throw new Error('Novel not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

module.exports = {
  getNovels,
  getNovelById,
  createNovel,
  updateNovel,
  deleteNovel,
};
