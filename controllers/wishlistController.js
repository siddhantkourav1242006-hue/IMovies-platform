const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('movies');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, movies: [] });
    }
    res.json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle movie in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, movies: [] });
    }

    const index = wishlist.movies.indexOf(movieId);
    let added = false;
    if (index > -1) {
      wishlist.movies.splice(index, 1);
      added = false;
    } else {
      wishlist.movies.push(movieId);
      added = true;
    }

    await wishlist.save();
    res.json({
      success: true,
      data: {
        added,
        movieCount: wishlist.movies.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
