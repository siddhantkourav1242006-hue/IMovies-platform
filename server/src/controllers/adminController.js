/**
 * iMovies - Admin Controller
 * Dashboard statistics for admin panel
 */
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = async (req, res, next) => {
  try {
    // Run all counts in parallel
    const [
      totalUsers,
      totalMovies,
      nowShowingMovies,
      comingSoonMovies,
      totalTheatres,
      activeShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Movie.countDocuments({ status: 'now_showing' }),
      Movie.countDocuments({ status: 'coming_soon' }),
      Theatre.countDocuments(),
      Show.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title')
      .populate('theatreId', 'name city')
      .sort({ bookedAt: -1 })
      .limit(10);

    // Revenue by movie (top 5)
    const revenueByMovie = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$movieId',
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $project: {
          _id: 0,
          movieId: '$_id',
          title: '$movie.title',
          totalRevenue: 1,
          bookingCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers },
        movies: {
          total: totalMovies,
          nowShowing: nowShowingMovies,
          comingSoon: comingSoonMovies,
        },
        theatres: { total: totalTheatres },
        shows: { active: activeShows },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
        },
        revenue: {
          total: totalRevenue,
          byMovie: revenueByMovie,
        },
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
