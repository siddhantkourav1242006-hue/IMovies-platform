/**
 * iMovies - Movie Model
 * Stores movie information including genre, language, and poster display config
 */
const mongoose = require('mongoose');
const slugify = require('slugify');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      maxlength: [2000, 'Synopsis cannot exceed 2000 characters'],
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one genre is required',
      },
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    posterColor: {
      type: String,
      default: '#1a1a2e',
    },
    posterShape: {
      type: String,
      enum: ['circle', 'triangle', 'diamond', 'hexagon', 'cross', 'ring', 'square', 'star', 'waves', 'bars'],
      default: 'circle',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    cities: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'now_showing',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes for common queries
movieSchema.index({ slug: 1 });
movieSchema.index({ status: 1, cities: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ featured: 1, status: 1 });

/**
 * Auto-generate slug from title before saving
 */
movieSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);
