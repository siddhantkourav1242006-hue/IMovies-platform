/**
 * iMovies - Seat Model
 * Individual seat for a show with TTL-based lock expiry
 * 
 * The lockedAt field has a TTL index that auto-expires documents' lock status
 * after 5 minutes, preventing abandoned seat locks from persisting.
 */
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
    },
    row: {
      type: String,
      required: [true, 'Row is required'],
      trim: true,
    },
    number: {
      type: Number,
      required: [true, 'Seat number is required'],
      min: [1, 'Seat number must be at least 1'],
    },
    type: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      required: [true, 'Seat type is required'],
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for fast seat lookups per show
seatSchema.index({ showId: 1, row: 1, number: 1 }, { unique: true });

// Index for seat status queries
seatSchema.index({ showId: 1, status: 1 });

// Index on lockedBy for user's locked seats
seatSchema.index({ lockedBy: 1, status: 1 });

/**
 * TTL index on lockedAt — MongoDB will auto-remove the lock after 5 minutes.
 * However, we handle TTL expiry in application logic rather than document deletion.
 * We use a partial index + a scheduled check approach instead.
 * 
 * NOTE: MongoDB TTL indexes delete entire documents, which we don't want.
 * Instead, we rely on application-level TTL checks:
 * - On seat map queries, we check if lockedAt + 5min < now and reset to available
 * - The seatService handles this cleanup
 */

/**
 * Check if a seat lock has expired (5 minute TTL)
 */
seatSchema.methods.isLockExpired = function () {
  if (this.status !== 'locked' || !this.lockedAt) return false;
  const lockDuration = 5 * 60 * 1000; // 5 minutes in ms
  return Date.now() - this.lockedAt.getTime() > lockDuration;
};

/**
 * Static method to clean up expired locks for a show
 */
seatSchema.statics.cleanExpiredLocks = async function (showId) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const result = await this.updateMany(
    {
      showId,
      status: 'locked',
      lockedAt: { $lt: fiveMinutesAgo },
    },
    {
      $set: { status: 'available', lockedBy: null, lockedAt: null },
    }
  );
  return result.modifiedCount;
};

module.exports = mongoose.model('Seat', seatSchema);
