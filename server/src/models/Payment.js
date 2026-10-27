/**
 * iMovies - Payment Model
 * Tracks payment transactions across multiple gateways
 */
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal'],
      required: [true, 'Payment gateway is required'],
    },
    gatewayOrderId: {
      type: String,
      default: null,
    },
    gatewayPaymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ gatewayOrderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
