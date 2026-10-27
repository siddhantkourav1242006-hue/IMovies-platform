const Review = require('../models/Review');
const Movie = require('../models/Movie');

/**
 * Recalculate movie average rating
 */
const recalculateRating = async (movieId) => {
  const stats = await Review.aggregate([
    { $match: { movieId, status: 'approved' } },
    {
      $group: {
        _id: '$movieId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
    });
  }
};

/**
 * @desc    Get reviews for a movie
 * @route   GET /api/reviews/movie/:movieId
 * @access  Public
 */
const getMovieReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      movieId: req.params.movieId,
      status: 'approved',
    })
      .populate('userId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a review for a movie
 * @route   POST /api/reviews
 * @access  Private (user)
 */
const createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user._id;

    const existing = await Review.findOne({ userId, movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this movie.',
      });
    }

    const review = await Review.create({
      userId,
      movieId,
      rating: Number(rating),
      comment,
      status: 'approved',
    });

    await recalculateRating(movieId);

    const populated = await Review.findById(review._id).populate('userId', 'name city');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: get all reviews for moderation
 * @route   GET /api/reviews/admin
 * @access  Private (admin)
 */
const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: update review status (approve/reject/delete)
 * @route   PUT /api/reviews/admin/:id
 * @access  Private (admin)
 */
const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await recalculateRating(review.movieId);

    res.status(200).json({
      success: true,
      message: `Review marked as ${status}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  getAdminReviews,
  moderateReview,
};
