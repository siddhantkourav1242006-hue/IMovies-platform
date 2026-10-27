/**
 * iMovies - Show Routes
 * Public: GET shows
 * Admin: POST, PUT, DELETE shows
 */
const express = require('express');
const { body, param } = require('express-validator');
const {
  getShows,
  createShow,
  updateShow,
  deleteShow,
} = require('../controllers/showController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// Public
router.get('/', getShows);

// Admin
router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('movieId').isMongoId().withMessage('Valid movie ID is required'),
    body('theatreId').isMongoId().withMessage('Valid theatre ID is required'),
    body('screenName').trim().notEmpty().withMessage('Screen name is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time')
      .trim()
      .notEmpty()
      .withMessage('Time is required')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Time must be in HH:MM format'),
    body('pricing.standard').isFloat({ min: 0 }).withMessage('Standard price is required'),
    body('pricing.premium').isFloat({ min: 0 }).withMessage('Premium price is required'),
    body('pricing.vip').isFloat({ min: 0 }).withMessage('VIP price is required'),
    validate,
  ],
  createShow
);

router.put(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid show ID'),
    body('date').optional().isISO8601(),
    body('time').optional().matches(/^\d{2}:\d{2}$/),
    body('pricing.standard').optional().isFloat({ min: 0 }),
    body('pricing.premium').optional().isFloat({ min: 0 }),
    body('pricing.vip').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'cancelled']),
    validate,
  ],
  updateShow
);

router.delete(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid show ID'),
    validate,
  ],
  deleteShow
);

module.exports = router;
