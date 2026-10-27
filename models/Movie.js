const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    cast: [
      {
        name: String,
        role: String,
        photo: String,
      },
    ],
    director: {
      type: String,
      default: '',
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'U/A', 'PG-13', 'R'],
      default: 'UA',
    },
    status: {
      type: String,
      enum: ['now-showing', 'coming-soon'],
      default: 'now-showing',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

MovieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', MovieSchema);
