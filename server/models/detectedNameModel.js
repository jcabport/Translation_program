const mongoose = require('mongoose');

const detectedNameSchema = new mongoose.Schema(
  {
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedTranslation: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['character', 'location', 'organization', 'item', 'concept', 'other', 'unknown'],
      default: 'unknown',
    },
    context: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'ignored'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const DetectedName = mongoose.model('DetectedName', detectedNameSchema);

module.exports = DetectedName;
