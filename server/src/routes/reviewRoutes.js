const express = require('express');
const { body, param } = require('express-validator');
const {
  getMovieReviews,
  createReview,
  getAdminReviews,
  moderateReview,
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// Public: get approved reviews for a movie
router.get('/movie/:movieId', getMovieReviews);

// Private: submit a review
router.post(
  '/',
  auth,
  [
    body('movieId').isMongoId().withMessage('Valid movie ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().isLength({ min: 3, max: 1000 }).withMessage('Comment must be between 3 and 1000 characters'),
    validate,
  ],
  createReview
);

// Admin moderation
router.get('/admin', auth, role(['admin']), getAdminReviews);
router.put('/admin/:id', auth, role(['admin']), moderateReview);

module.exports = router;
