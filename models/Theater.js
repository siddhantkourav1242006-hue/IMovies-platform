const mongoose = require('mongoose');

const ScreenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
    default: 10,
  },
  seatsPerRow: {
    type: Number,
    required: true,
    default: 12,
  },
  seatMap: [
    {
      row: { type: String, required: true },
      type: {
        type: String,
        enum: ['standard', 'premium', 'vip'],
        default: 'standard',
      },
      seats: { type: Number, required: true },
    },
  ],
});

const TheaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theater name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide theater location'],
    },
    screens: [ScreenSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theater', TheaterSchema);
