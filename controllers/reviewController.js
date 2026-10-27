const Review = require('../models/Review');
const Movie = require('../models/Movie');

// Helper to recalculate movie rating
const updateMovieRating = async (movieId) => {
  const stats = await Review.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;

    const existing = await Review.findOne({ user: req.user.id, movie: movieId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this movie' });
    }

    const review = await Review.create({
      user: req.user.id,
      movie: movieId,
      rating,
      comment,
    });

    await updateMovieRating(review.movie);
    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Review.countDocuments({ movie: req.params.movieId });
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const movieId = review.movie;
    await review.deleteOne();
    await updateMovieRating(movieId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
