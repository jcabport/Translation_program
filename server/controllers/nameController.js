const { Novel, NameMapping, DetectedName, Chapter } = require('../models');

// @desc    Get all name mappings for a novel
// @route   GET /api/novels/:novelId/names
// @access  Public
const getNameMappings = async (req, res) => {
  try {
    const nameMappings = await NameMapping.find({ novel: req.params.novelId })
      .sort({ originalName: 1 });
    
    res.json(nameMappings);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error: ' + error.message);
  }
};

// @desc    Create a new name mapping
// @route   POST /api/novels/:novelId/names
// @access  Public
const createNameMapping = async (req, res) => {
  try {
    const { originalName, translatedName, type, context } = req.body;
    const novelId = req.params.novelId;
    
    // Check if novel exists
    const novel = await Novel.findById(novelId);
    if (!novel) {
      res.status(404);
      throw new Error('Novel not found');
    }
    
    // Check if name mapping already exists
    const existingMapping = await NameMapping.findOne({ 
      novel: novelId, 
      originalName 
    });
    
    if (existingMapping) {
      res.status(400);
      throw new Error(`Name mapping for "${originalName}" already exists`);
    }
    
    const nameMapping = await NameMapping.create({
      novel: novelId,
      originalName,
      translatedName,
      type: type || 'character',
      context,
    });
    
    res.status(201).json(nameMapping);
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    throw new Error('Invalid name mapping data: ' + error.message);
  }
};

// @desc    Update a name mapping
// @route   PUT /api/names/:id
// @access  Public
const updateNameMapping = async (req, res) => {
  try {
    const { translatedName, type } = req.body;
    
    const nameMapping = await NameMapping.findById(req.params.id);
    
    if (nameMapping) {
      nameMapping.translatedName = translatedName || nameMapping.translatedName;
      nameMapping.type = type || nameMapping.type;
      
      const updatedNameMapping = await nameMapping.save();
      res.json(updatedNameMapping);
    } else {
      res.status(404);
      throw new Error('Name mapping not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Delete a name mapping
// @route   DELETE /api/names/:id
// @access  Public
const deleteNameMapping = async (req, res) => {
  try {
    const nameMapping = await NameMapping.findById(req.params.id);
    
    if (nameMapping) {
      await nameMapping.remove();
      res.json({ message: 'Name mapping removed' });
    } else {
      res.status(404);
      throw new Error('Name mapping not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Get all detected names for a chapter
// @route   GET /api/novels/:novelId/chapters/:chapterId/detected-names
// @access  Public
const getDetectedNames = async (req, res) => {
  try {
    const detectedNames = await DetectedName.find({ 
      novel: req.params.novelId,
      chapter: req.params.chapterId,
      status: 'pending'
    });
    
    res.json(detectedNames);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error: ' + error.message);
  }
};

// @desc    Resolve detected names
// @route   PUT /api/novels/:novelId/chapters/:chapterId/resolve-names
// @access  Public
const resolveDetectedNames = async (req, res) => {
  try {
    const { resolvedNames } = req.body;
    const { novelId, chapterId } = req.params;
    
    if (!resolvedNames || !Array.isArray(resolvedNames)) {
      res.status(400);
      throw new Error('resolvedNames must be an array');
    }
    
    // Process each resolved name
    const results = await Promise.all(resolvedNames.map(async (name) => {
      const { detectedNameId, action, translatedName, type } = name;
      
      // Find the detected name
      const detectedName = await DetectedName.findById(detectedNameId);
      
      if (!detectedName) {
        return { 
          id: detectedNameId, 
          success: false, 
          message: 'Detected name not found' 
        };
      }
      
      if (action === 'add') {
        // Add to name dictionary
        await NameMapping.create({
          novel: novelId,
          originalName: detectedName.originalText,
          translatedName,
          type: type || 'character',
          context: detectedName.context,
        });
        
        // Mark as resolved
        detectedName.status = 'resolved';
        await detectedName.save();
        
        return { id: detectedNameId, success: true, action: 'added' };
      } else if (action === 'ignore') {
        // Mark as ignored
        detectedName.status = 'ignored';
        await detectedName.save();
        
        return { id: detectedNameId, success: true, action: 'ignored' };
      } else {
        return { 
          id: detectedNameId, 
          success: false, 
          message: 'Invalid action' 
        };
      }
    }));
    
    // Check if all detected names for this chapter are resolved
    const pendingNames = await DetectedName.countDocuments({
      novel: novelId,
      chapter: chapterId,
      status: 'pending'
    });
    
    if (pendingNames === 0) {
      // Update chapter status
      await Chapter.updateOne(
        { _id: chapterId },
        { pendingNames: false }
      );
    }
    
    res.json({ results });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

module.exports = {
  getNameMappings,
  createNameMapping,
  updateNameMapping,
  deleteNameMapping,
  getDetectedNames,
  resolveDetectedNames,
};
