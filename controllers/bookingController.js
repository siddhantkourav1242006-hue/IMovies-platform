const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Coupon = require('../models/Coupon');
const { generateBookingId } = require('../utils/helpers');

// @desc    Create new booking with atomic seat reservation
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats, couponCode, fnbItems = [] } = req.body;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select showtime and seats' });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movie theater');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    const requestedLabels = seats.map((s) => s.label);

    // ATOMIC RESERVATION: check if any requested seat is in bookedSeats, if not push them
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: requestedLabels },
      },
      {
        $addToSet: { bookedSeats: { $each: requestedLabels } },
      },
      { new: true }
    );

    if (!updatedShowtime) {
      return res.status(400).json({
        success: false,
        message: 'One or more of the selected seats are already booked. Please choose different seats.',
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    const formattedSeats = seats.map((s) => {
      const seatPrice = showtime.price[s.type] || showtime.price.standard;
      subtotal += seatPrice;
      return {
        row: s.row,
        number: s.number,
        type: s.type,
        label: s.label,
        price: seatPrice,
      };
    });

    // F&B Total
    let fnbTotal = 0;
    fnbItems.forEach((f) => {
      fnbTotal += (Number(f.price) || 0) * (Number(f.quantity) || 1);
    });

    const convenienceFee = 30;
    let discount = 0;

    // Validate Coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (coupon) {
        const now = new Date();
        const validDates = (!coupon.validFrom || coupon.validFrom <= now) && (!coupon.validUntil || coupon.validUntil >= now);
        const validUsage = coupon.usageLimit ? coupon.usedCount < coupon.usageLimit : true;
        const validMin = subtotal >= coupon.minBookingAmount;

        if (validDates && validUsage && validMin) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          // Increment used count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + fnbTotal + convenienceFee - discount);
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      user: req.user.id,
      showtime: showtimeId,
      movie: showtime.movie._id,
      theater: showtime.theater._id,
      seats: formattedSeats,
      fnbItems,
      subtotal,
      discount,
      fnbTotal,
      convenienceFee,
      totalAmount,
      couponCode: discount > 0 ? couponCode : '',
      paymentStatus: 'completed',
      status: 'confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl duration certification language')
      .populate('theater', 'name location')
      .populate('showtime', 'date time screenIndex');

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filter = { user: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('movie', 'title posterUrl duration certification language')
      .populate('theater', 'name location')
      .populate('showtime', 'date time screenIndex')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    let booking;
    // Query by MongoDB ID or bookingId string (e.g. IMV-...)
    if (req.params.id.startsWith('IMV-')) {
      booking = await Booking.findOne({ bookingId: req.params.id });
    } else {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const populated = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theater')
      .populate('showtime')
      .populate('user', 'name email phone');

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking and release seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtime');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Release seats from showtime
    const seatLabels = booking.seats.map((s) => s.label);
    await Showtime.findByIdAndUpdate(booking.showtime._id, {
      $pull: { bookedSeats: { $in: seatLabels } },
    });

    // Update coupon usage if applicable
    if (booking.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: booking.couponCode },
        { $inc: { usedCount: -1 } }
      );
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theater', 'name')
      .populate('showtime', 'date time')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};
