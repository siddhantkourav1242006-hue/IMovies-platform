const express = require('express');
const router = express.Router();
const { createReview, getMovieReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/movie/:movieId', getMovieReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
