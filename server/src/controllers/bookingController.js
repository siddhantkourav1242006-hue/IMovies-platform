/**
 * iMovies - Booking Controller
 * Booking creation (after payment), listing, detail, and cancellation
 */
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Payment = require('../models/Payment');
const SeatService = require('../services/seatService');
const EmailService = require('../services/emailService');

/**
 * @desc    Create booking after successful payment
 * @route   POST /api/bookings
 * @access  Private (user)
 */
const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, paymentId } = req.body;
    const userId = req.user._id;

    // Verify show exists
    const show = await Show.findById(showId).populate('theatreId');
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Verify payment exists and is successful
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not confirmed. Cannot create booking.',
      });
    }

    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Payment does not belong to this user.',
      });
    }

    // Confirm seats (locked → booked) atomically
    const seatResult = await SeatService.confirmSeats(showId, seats, userId);

    if (!seatResult.success) {
      return res.status(409).json({
        success: false,
        message: 'Failed to confirm some seats. Lock may have expired.',
        data: { failedSeats: seatResult.failedSeats },
      });
    }

    // Calculate total amount from confirmed seat types and show pricing
    let totalAmount = 0;
    const bookingSeats = seatResult.confirmedSeats.map((seat) => {
      const price = show.pricing[seat.type] || show.pricing.standard;
      totalAmount += price;
      return { row: seat.row, number: seat.number, type: seat.type };
    });

    // Create booking
    const booking = await Booking.create({
      userId,
      showId,
      movieId: show.movieId,
      theatreId: show.theatreId._id,
      seats: bookingSeats,
      totalAmount,
      status: 'confirmed',
      paymentId: payment._id,
      bookedAt: new Date(),
    });

    // Link booking to payment
    payment.bookingId = booking._id;
    await payment.save();

    // Broadcast seat booking via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seats:booked', {
        showId,
        seats: bookingSeats.map((s) => ({
          row: s.row,
          number: s.number,
          status: 'booked',
        })),
      });
    }

    // Send confirmation email (async, don't block response)
    const movie = await Movie.findById(show.movieId);
    EmailService.sendBookingConfirmation(booking, req.user, movie, show).catch((err) => {
      console.error('Email send error:', err.message);
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's bookings
 * @route   GET /api/bookings
 * @access  Private (user)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId', 'title slug posterColor posterShape language duration')
      .populate('theatreId', 'name city address')
      .populate('showId', 'date time screenName')
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private (user — own booking only)
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId', 'title slug posterColor posterShape language duration genre')
      .populate('theatreId', 'name city address')
      .populate('showId', 'date time screenName pricing')
      .populate('paymentId', 'amount currency gateway status');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ensure user can only view their own booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking does not belong to you.',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (user — own booking only)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ensure user can only cancel their own booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking does not belong to you.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.',
      });
    }

    // Release the booked seats
    await SeatService.releaseBookedSeats(
      booking.showId,
      booking.seats,
      booking.userId
    );

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Initiate refund on payment (mark as refunded)
    if (booking.paymentId) {
      const payment = await Payment.findById(booking.paymentId);
      if (payment && payment.status === 'success') {
        payment.status = 'refunded';
        await payment.save();
      }
    }

    // Broadcast seat release via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${booking.showId}`).emit('seats:unlocked', {
        showId: booking.showId.toString(),
        seats: booking.seats.map((s) => ({
          row: s.row,
          number: s.number,
          status: 'available',
        })),
      });
    }

    // Send cancellation email (async)
    const movie = await Movie.findById(booking.movieId);
    EmailService.sendBookingCancellation(booking, req.user, movie).catch((err) => {
      console.error('Email send error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund will be processed.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule a booking to a new show/time
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private (user — own booking only)
 */
const rescheduleBooking = async (req, res, next) => {
  try {
    const { newShowId, newSeats } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking does not belong to you.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule a cancelled booking.',
      });
    }

    const newShow = await Show.findById(newShowId);
    if (!newShow) {
      return res.status(404).json({
        success: false,
        message: 'New show not found.',
      });
    }

    // Release old seats
    await SeatService.releaseBookedSeats(
      booking.showId,
      booking.seats,
      booking.userId
    );

    // Confirm new seats
    const seatResult = await SeatService.confirmSeats(newShowId, newSeats, req.user._id);
    if (!seatResult.success) {
      // Re-lock or re-book old seats if new seats fail
      await SeatService.confirmSeats(booking.showId, booking.seats, req.user._id);
      return res.status(409).json({
        success: false,
        message: 'Failed to reserve new seats. Please select different seats.',
        data: { failedSeats: seatResult.failedSeats },
      });
    }

    // Update booking
    const oldShowId = booking.showId;
    booking.showId = newShowId;
    booking.theatreId = newShow.theatreId;
    booking.seats = newSeats;
    booking.rescheduledAt = new Date();
    await booking.save();

    // Broadcast seat updates for both shows via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${oldShowId}`).emit('seats:unlocked', {
        showId: oldShowId.toString(),
        seats: booking.seats.map((s) => ({ row: s.row, number: s.number, status: 'available' })),
      });
      io.to(`show:${newShowId}`).emit('seats:booked', {
        showId: newShowId.toString(),
        seats: newSeats.map((s) => ({ row: s.row, number: s.number, status: 'booked' })),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking, rescheduleBooking };
