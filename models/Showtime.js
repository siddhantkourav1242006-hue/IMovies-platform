const mongoose = require('mongoose');

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
      index: true,
    },
    screenIndex: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true, // e.g. "10:30 AM", "01:30 PM", "04:30 PM", "08:00 PM"
    },
    price: {
      standard: { type: Number, default: 150 },
      premium: { type: Number, default: 250 },
      vip: { type: Number, default: 400 },
    },
    bookedSeats: {
      type: [String], // Array of seat codes e.g. ["A1", "A2", "C5"]
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', ShowtimeSchema);
