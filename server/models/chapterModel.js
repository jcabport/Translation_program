const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sourceText: {
      type: String,
      required: true,
    },
    translation: {
      raw: {
        type: String,
      },
      processed: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
    summary: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'translated', 'needs_review', 'completed'],
      default: 'pending',
    },
    pendingNames: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure chapters are unique per novel
chapterSchema.index({ novel: 1, number: 1 }, { unique: true });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
