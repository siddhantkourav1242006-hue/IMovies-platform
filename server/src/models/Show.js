/**
 * iMovies - Show Model
 * Represents a specific screening of a movie at a theatre screen
 */
const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre ID is required'],
    },
    screenName: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Show date is required'],
    },
    time: {
      type: String, // e.g., "10:00", "14:30", "18:00"
      required: [true, 'Show time is required'],
      trim: true,
    },
    pricing: {
      standard: {
        type: Number,
        required: [true, 'Standard price is required'],
        min: [0, 'Price cannot be negative'],
      },
      premium: {
        type: Number,
        required: [true, 'Premium price is required'],
        min: [0, 'Price cannot be negative'],
      },
      vip: {
        type: Number,
        required: [true, 'VIP price is required'],
        min: [0, 'Price cannot be negative'],
      },
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes for common queries
showSchema.index({ movieId: 1, date: 1 });
showSchema.index({ theatreId: 1, date: 1 });
showSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Show', showSchema);
