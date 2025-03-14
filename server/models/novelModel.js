const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    sourceLanguage: {
      type: String,
      required: true,
      enum: ['ko', 'ja'], // Korean or Japanese for now
      default: 'ko',
    },
    targetLanguage: {
      type: String,
      required: true,
      enum: ['en'], // English only for now
      default: 'en',
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String, // URL to image
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Novel = mongoose.model('Novel', novelSchema);

module.exports = Novel;
