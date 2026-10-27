/**
 * iMovies - Favorite Controller
 * Manage user's movie watchlist
 */
const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

/**
 * @desc    Get user's watchlist
 * @route   GET /api/favorites
 * @access  Private (user)
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('movieId', 'title slug synopsis genre language duration rating releaseDate posterColor posterShape status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add movie to watchlist
 * @route   POST /api/favorites/:movieId
 * @access  Private (user)
 */
const addFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.user._id,
      movieId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Movie is already in your watchlist.',
      });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      movieId,
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist.',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove movie from watchlist
 * @route   DELETE /api/favorites/:movieId
 * @access  Private (user)
 */
const removeFavorite = async (req, res, next) => {
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.user._id,
      movieId: req.params.movieId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your watchlist.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
