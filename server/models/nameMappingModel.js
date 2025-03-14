const mongoose = require('mongoose');

const nameMappingSchema = new mongoose.Schema(
  {
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    translatedName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['character', 'location', 'organization', 'item', 'concept', 'other'],
      default: 'character',
    },
    firstDetected: {
      type: Date,
      default: Date.now,
    },
    frequency: {
      type: Number,
      default: 1,
    },
    context: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure name mappings are unique per novel
nameMappingSchema.index({ novel: 1, originalName: 1 }, { unique: true });

const NameMapping = mongoose.model('NameMapping', nameMappingSchema);

module.exports = NameMapping;
