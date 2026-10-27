/**
 * iMovies - Movie Routes
 * Public: GET movies, featured, by slug
 * Admin: POST, PUT, DELETE movies
 */
const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getMovies,
  getFeaturedMovies,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:slug', getMovieBySlug);

// Admin routes
router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('synopsis').trim().notEmpty().withMessage('Synopsis is required'),
    body('genre').isArray({ min: 1 }).withMessage('At least one genre is required'),
    body('language').trim().notEmpty().withMessage('Language is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes)'),
    body('releaseDate').isISO8601().withMessage('Valid release date is required'),
    body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Rating must be 0-10'),
    body('posterColor').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Invalid hex color'),
    body('posterShape').optional().isIn(['circle', 'triangle', 'diamond', 'hexagon', 'cross', 'ring', 'square', 'star', 'waves', 'bars']),
    body('featured').optional().isBoolean(),
    body('cities').optional().isArray(),
    body('status').optional().isIn(['now_showing', 'coming_soon', 'archived']),
    validate,
  ],
  createMovie
);

router.put(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid movie ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('synopsis').optional().trim().notEmpty(),
    body('genre').optional().isArray({ min: 1 }),
    body('language').optional().trim().notEmpty(),
    body('duration').optional().isInt({ min: 1 }),
    body('rating').optional().isFloat({ min: 0, max: 10 }),
    body('status').optional().isIn(['now_showing', 'coming_soon', 'archived']),
    validate,
  ],
  updateMovie
);

router.delete(
  '/:id',
  auth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid movie ID'),
    validate,
  ],
  deleteMovie
);

module.exports = router;
