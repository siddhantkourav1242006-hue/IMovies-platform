/**
 * iMovies - Seat Controller
 * Seat map retrieval, lock, and unlock with Socket.io broadcasts
 */
const SeatService = require('../services/seatService');
const Show = require('../models/Show');

/**
 * @desc    Get seat map for a show
 * @route   GET /api/seats/:showId
 * @access  Public
 */
const getSeatMap = async (req, res, next) => {
  try {
    const { showId } = req.params;

    // Verify show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    const seats = await SeatService.getSeatMap(showId);

    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lock seats (5-minute hold)
 * @route   POST /api/seats/lock
 * @access  Private (user)
 */
const lockSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user._id;

    // Verify show exists and is active
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    if (show.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This show is no longer active.',
      });
    }

    // Attempt to lock seats atomically
    const result = await SeatService.lockSeats(showId, seats, userId);

    if (!result.success) {
      return res.status(409).json({
        success: false,
        message: 'Some seats are no longer available.',
        data: {
          failedSeats: result.failedSeats,
        },
      });
    }

    // Broadcast seat lock event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seats:locked', {
        showId,
        seats: result.lockedSeats.map((s) => ({
          row: s.row,
          number: s.number,
          status: s.status,
        })),
        lockedBy: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.lockedSeats.length} seat(s) locked for 5 minutes.`,
      data: {
        lockedSeats: result.lockedSeats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlock seats (release hold)
 * @route   POST /api/seats/unlock
 * @access  Private (user)
 */
const unlockSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user._id;

    let unlockedCount;

    if (seats && seats.length > 0) {
      // Unlock specific seats
      unlockedCount = await SeatService.unlockSeats(showId, seats, userId);
    } else {
      // Unlock all user's seats for this show
      unlockedCount = await SeatService.unlockAllUserSeats(showId, userId);
    }

    // Broadcast seat unlock event via Socket.io
    const io = req.app.get('io');
    if (io) {
      const unlockData = seats && seats.length > 0
        ? seats.map((s) => ({ row: s.row, number: s.number, status: 'available' }))
        : []; // Empty means refresh full map

      io.to(`show:${showId}`).emit('seats:unlocked', {
        showId,
        seats: unlockData,
        unlockedBy: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: `${unlockedCount} seat(s) released.`,
      data: { unlockedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSeatMap, lockSeats, unlockSeats };
