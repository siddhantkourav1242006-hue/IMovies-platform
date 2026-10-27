/**
 * iMovies - Booking Routes
 * POST create, GET list, GET detail, PUT cancel
 */
const express = require('express');
const { body, param } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  rescheduleBooking,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// Create booking
router.post(
  '/',
  bookingLimiter,
  [
    body('showId').isMongoId().withMessage('Valid show ID is required'),
    body('seats')
      .isArray({ min: 1 })
      .withMessage('At least one seat is required'),
    body('seats.*.row').trim().notEmpty().withMessage('Seat row is required'),
    body('seats.*.number').isInt({ min: 1 }).withMessage('Seat number must be a positive integer'),
    body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
    validate,
  ],
  createBooking
);

// Get my bookings
router.get('/', getMyBookings);

// Get booking detail
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    validate,
  ],
  getBooking
);

// Cancel booking
router.put(
  '/:id/cancel',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    validate,
  ],
  cancelBooking
);

// Reschedule booking
router.put(
  '/:id/reschedule',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('newShowId').isMongoId().withMessage('Valid new show ID is required'),
    body('newSeats').isArray({ min: 1 }).withMessage('At least one new seat is required'),
    validate,
  ],
  rescheduleBooking
);

module.exports = router;
