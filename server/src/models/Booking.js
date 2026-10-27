/**
 * iMovies - Booking Model
 * Records confirmed ticket bookings with seat details and payment reference
 */
const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['standard', 'premium', 'vip'], required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
    },
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
    seats: {
      type: [bookingSeatSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one seat is required',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'rescheduled'],
      default: 'confirmed',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes for user bookings and show lookups
bookingSchema.index({ userId: 1, bookedAt: -1 });
bookingSchema.index({ showId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
