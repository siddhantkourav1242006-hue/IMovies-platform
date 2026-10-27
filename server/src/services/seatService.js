/**
 * iMovies - Seat Service
 * Handles atomic seat lock/unlock/confirm operations
 * Prevents double booking through findOneAndUpdate with status checks
 */
const Seat = require('../models/Seat');
const Show = require('../models/Show');

class SeatService {
  /**
   * Lock seats for a user (5-minute hold)
   * Uses atomic findOneAndUpdate to prevent race conditions
   * 
   * @param {string} showId - Show ID
   * @param {Array<{row: string, number: number}>} seats - Array of seat identifiers
   * @param {string} userId - User requesting the lock
   * @returns {Object} { success, lockedSeats, failedSeats }
   */
  static async lockSeats(showId, seats, userId) {
    // First, clean up any expired locks for this show
    await Seat.cleanExpiredLocks(showId);

    const lockedSeats = [];
    const failedSeats = [];

    for (const seat of seats) {
      // Atomic update: only lock if currently available
      const updatedSeat = await Seat.findOneAndUpdate(
        {
          showId,
          row: seat.row,
          number: seat.number,
          status: 'available',
        },
        {
          $set: {
            status: 'locked',
            lockedBy: userId,
            lockedAt: new Date(),
          },
        },
        { new: true }
      );

      if (updatedSeat) {
        lockedSeats.push(updatedSeat);
      } else {
        // Check if already locked by same user
        const existingSeat = await Seat.findOne({
          showId,
          row: seat.row,
          number: seat.number,
          status: 'locked',
          lockedBy: userId,
        });

        if (existingSeat) {
          // Refresh the lock timer
          existingSeat.lockedAt = new Date();
          await existingSeat.save();
          lockedSeats.push(existingSeat);
        } else {
          failedSeats.push({
            row: seat.row,
            number: seat.number,
            reason: 'Seat is not available (locked or booked by another user)',
          });
        }
      }
    }

    // If some seats failed, unlock any we just locked (all-or-nothing)
    if (failedSeats.length > 0 && lockedSeats.length > 0) {
      const seatIds = lockedSeats.map((s) => s._id);
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        {
          $set: { status: 'available', lockedBy: null, lockedAt: null },
        }
      );
      return {
        success: false,
        lockedSeats: [],
        failedSeats: [
          ...failedSeats,
          ...lockedSeats.map((s) => ({
            row: s.row,
            number: s.number,
            reason: 'Rolled back due to partial lock failure',
          })),
        ],
      };
    }

    return {
      success: lockedSeats.length > 0,
      lockedSeats,
      failedSeats,
    };
  }

  /**
   * Unlock seats held by a user
   * 
   * @param {string} showId - Show ID
   * @param {Array<{row: string, number: number}>} seats - Array of seat identifiers
   * @param {string} userId - User requesting the unlock
   * @returns {number} Number of seats unlocked
   */
  static async unlockSeats(showId, seats, userId) {
    let unlockedCount = 0;

    for (const seat of seats) {
      const result = await Seat.findOneAndUpdate(
        {
          showId,
          row: seat.row,
          number: seat.number,
          status: 'locked',
          lockedBy: userId,
        },
        {
          $set: { status: 'available', lockedBy: null, lockedAt: null },
        },
        { new: true }
      );

      if (result) unlockedCount++;
    }

    return unlockedCount;
  }

  /**
   * Unlock ALL seats held by a user for a given show
   * 
   * @param {string} showId - Show ID
   * @param {string} userId - User ID
   * @returns {number} Number of seats unlocked
   */
  static async unlockAllUserSeats(showId, userId) {
    const result = await Seat.updateMany(
      {
        showId,
        status: 'locked',
        lockedBy: userId,
      },
      {
        $set: { status: 'available', lockedBy: null, lockedAt: null },
      }
    );
    return result.modifiedCount;
  }

  /**
   * Confirm seats after successful payment
   * Changes status from locked → booked atomically
   * 
   * @param {string} showId - Show ID
   * @param {Array<{row: string, number: number}>} seats - Array of seat identifiers
   * @param {string} userId - User who owns the booking
   * @returns {Object} { success, confirmedSeats, failedSeats }
   */
  static async confirmSeats(showId, seats, userId) {
    const confirmedSeats = [];
    const failedSeats = [];

    for (const seat of seats) {
      const updatedSeat = await Seat.findOneAndUpdate(
        {
          showId,
          row: seat.row,
          number: seat.number,
          status: 'locked',
          lockedBy: userId,
        },
        {
          $set: {
            status: 'booked',
            bookedBy: userId,
            lockedBy: null,
            lockedAt: null,
          },
        },
        { new: true }
      );

      if (updatedSeat) {
        confirmedSeats.push(updatedSeat);
      } else {
        failedSeats.push({
          row: seat.row,
          number: seat.number,
          reason: 'Seat not locked by this user or lock expired',
        });
      }
    }

    return {
      success: failedSeats.length === 0 && confirmedSeats.length > 0,
      confirmedSeats,
      failedSeats,
    };
  }

  /**
   * Release booked seats (for cancellation)
   * 
   * @param {string} showId - Show ID
   * @param {Array<{row: string, number: number}>} seats - Seats to release
   * @param {string} userId - User who owns the booking
   * @returns {number} Number of seats released
   */
  static async releaseBookedSeats(showId, seats, userId) {
    let releasedCount = 0;

    for (const seat of seats) {
      const result = await Seat.findOneAndUpdate(
        {
          showId,
          row: seat.row,
          number: seat.number,
          status: 'booked',
          bookedBy: userId,
        },
        {
          $set: { status: 'available', bookedBy: null, lockedBy: null, lockedAt: null },
        }
      );
      if (result) releasedCount++;
    }

    return releasedCount;
  }

  /**
   * Get seat map for a show with expired lock cleanup
   * 
   * @param {string} showId - Show ID
   * @returns {Array} Array of seat documents
   */
  static async getSeatMap(showId) {
    // Clean expired locks first
    await Seat.cleanExpiredLocks(showId);

    const seats = await Seat.find({ showId })
      .select('row number type status lockedBy')
      .sort({ row: 1, number: 1 });

    return seats;
  }

  /**
   * Generate seat documents for a show based on theatre screen layout
   * 
   * @param {string} showId - Show ID
   * @param {Object} screen - Screen config from Theatre model
   * @returns {Array} Created seat documents
   */
  static async generateSeatsForShow(showId, screen) {
    const seats = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Build a map from row letter → seat type based on layout
    const rowTypeMap = {};
    for (const layout of screen.seatLayout) {
      for (const row of layout.rows) {
        rowTypeMap[row] = layout.type;
      }
    }

    for (let r = 0; r < screen.rows; r++) {
      const rowLetter = rowLetters[r] || `R${r + 1}`;
      const seatType = rowTypeMap[rowLetter] || 'standard';

      for (let s = 1; s <= screen.seatsPerRow; s++) {
        seats.push({
          showId,
          row: rowLetter,
          number: s,
          type: seatType,
          status: 'available',
        });
      }
    }

    // Bulk insert all seats
    const createdSeats = await Seat.insertMany(seats);
    return createdSeats;
  }
}

module.exports = SeatService;
