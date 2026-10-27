/**
 * iMovies - Theatre Model
 * Stores theatre information with screen configurations and seat layouts
 */
const mongoose = require('mongoose');

const seatLayoutSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      required: true,
    },
    rows: {
      type: [String], // e.g., ['A', 'B', 'C'] — rows of this type
      required: true,
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    rows: {
      type: Number,
      required: [true, 'Number of rows is required'],
      min: [1, 'Must have at least 1 row'],
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Seats per row is required'],
      min: [1, 'Must have at least 1 seat per row'],
    },
    seatLayout: {
      type: [seatLayoutSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one seat layout section is required',
      },
    },
  },
  { _id: false }
);

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    screens: {
      type: [screenSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one screen is required',
      },
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index for city-based queries
theatreSchema.index({ city: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
