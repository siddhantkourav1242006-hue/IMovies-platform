const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
    },
    seats: [
      {
        row: { type: String, required: true },
        number: { type: Number, required: true },
        type: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
        label: { type: String, required: true }, // e.g. "A1"
        price: { type: Number, required: true },
      },
    ],
    fnbItems: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'FnBItem' },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    fnbTotal: {
      type: Number,
      default: 0,
    },
    convenienceFee: {
      type: Number,
      default: 30,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'pending', 'refunded'],
      default: 'completed',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
