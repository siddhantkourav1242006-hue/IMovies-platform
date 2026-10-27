/**
 * iMovies - Theatre Routes
 * Public: GET theatres
 * Admin: POST, PUT, DELETE theatres
 */
const express = require('express');
const { body, param } = require('express-validator');
const {
  getTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require('../controllers/theatreController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// Public
router.get('/', getTheatres);

// Admin
router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Theatre name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('screens').isArray({ min: 1 }).withMessage('At least one screen is required'),
    body('screens.*.name').trim().notEmpty().withMessage('Screen name is required'),
    body('screens.*.rows').isInt({ min: 1 }).withMessage('Rows must be a positive integer'),
    body('screens.*.seatsPerRow').isInt({ min: 1 }).withMessage('Seats per row must be a positive integer'),
    body('screens.*.seatLayout').isArray({ min: 1 }).withMessage('Seat layout is required'),
    validate,
  ],
  createTheatre
);

router.put(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid theatre ID'),
    body('name').optional().trim().notEmpty(),
    body('city').optional().trim().notEmpty(),
    body('address').optional().trim().notEmpty(),
    validate,
  ],
  updateTheatre
);

router.delete(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid theatre ID'),
    validate,
  ],
  deleteTheatre
);

module.exports = router;
