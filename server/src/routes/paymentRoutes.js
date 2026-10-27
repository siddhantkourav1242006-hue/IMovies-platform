/**
 * iMovies - Payment Routes
 * POST create, POST verify
 */
const express = require('express');
const { body } = require('express-validator');
const { createPayment, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All payment routes require authentication
router.use(auth);

// Initiate payment
router.post(
  '/create',
  bookingLimiter,
  [
    body('showId').isMongoId().withMessage('Valid show ID is required'),
    body('seats')
      .isArray({ min: 1 })
      .withMessage('At least one seat is required'),
    body('seats.*.row').trim().notEmpty().withMessage('Seat row is required'),
    body('seats.*.number').isInt({ min: 1 }).withMessage('Seat number must be a positive integer'),
    body('gateway')
      .optional()
      .isIn(['razorpay', 'stripe', 'paypal'])
      .withMessage('Invalid payment gateway'),
    validate,
  ],
  createPayment
);

// Verify payment
router.post(
  '/verify',
  [
    body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
    body('gatewayPayload').isObject().withMessage('Gateway payload is required'),
    validate,
  ],
  verifyPayment
);

module.exports = router;
