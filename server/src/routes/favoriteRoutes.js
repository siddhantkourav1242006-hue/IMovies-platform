/**
 * iMovies - Favorite Routes
 * GET list, POST add, DELETE remove
 */
const express = require('express');
const { param } = require('express-validator');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All favorite routes require authentication
router.use(auth);

// Get watchlist
router.get('/', getFavorites);

// Add to watchlist
router.post(
  '/:movieId',
  [
    param('movieId').isMongoId().withMessage('Invalid movie ID'),
    validate,
  ],
  addFavorite
);

// Remove from watchlist
router.delete(
  '/:movieId',
  [
    param('movieId').isMongoId().withMessage('Invalid movie ID'),
    validate,
  ],
  removeFavorite
);

module.exports = router;
