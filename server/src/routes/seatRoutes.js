/**
 * iMovies - Seat Routes
 * GET seat map, POST lock, POST unlock
 */
const express = require('express');
const { body, param } = require('express-validator');
const { getSeatMap, lockSeats, unlockSeats } = require('../controllers/seatController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get seat map for a show (public)
router.get(
  '/:showId',
  [
    param('showId').isMongoId().withMessage('Valid show ID is required'),
    validate,
  ],
  getSeatMap
);

// Lock seats (authenticated users)
router.post(
  '/lock',
  auth,
  [
    body('showId').isMongoId().withMessage('Valid show ID is required'),
    body('seats')
      .isArray({ min: 1 })
      .withMessage('At least one seat is required'),
    body('seats.*.row')
      .trim()
      .notEmpty()
      .withMessage('Seat row is required'),
    body('seats.*.number')
      .isInt({ min: 1 })
      .withMessage('Seat number must be a positive integer'),
    validate,
  ],
  lockSeats
);

// Unlock seats (authenticated users)
router.post(
  '/unlock',
  auth,
  [
    body('showId').isMongoId().withMessage('Valid show ID is required'),
    body('seats')
      .optional()
      .isArray()
      .withMessage('Seats must be an array'),
    body('seats.*.row')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Seat row is required'),
    body('seats.*.number')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Seat number must be a positive integer'),
    validate,
  ],
  unlockSeats
);

module.exports = router;
