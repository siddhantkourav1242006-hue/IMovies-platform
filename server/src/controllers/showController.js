/**
 * iMovies - Show Controller
 * CRUD for shows with auto-seat generation on creation
 */
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const Seat = require('../models/Seat');
const SeatService = require('../services/seatService');

/**
 * @desc    List shows (filter by movieId, city, date)
 * @route   GET /api/shows
 * @access  Public
 */
const getShows = async (req, res, next) => {
  try {
    const { movieId, city, date } = req.query;
    const filter = { status: 'active' };

    if (movieId) {
      filter.movieId = movieId;
    }

    if (date) {
      // Match shows on the given date (start to end of day)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    let shows = await Show.find(filter)
      .populate('movieId', 'title slug posterColor posterShape duration language')
      .populate('theatreId', 'name city address')
      .sort({ date: 1, time: 1 });

    // Filter by city (through populated theatre)
    if (city) {
      shows = shows.filter(
        (show) => show.theatreId && show.theatreId.city === city
      );
    }

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a show + auto-generate seats
 * @route   POST /api/shows
 * @access  Private (admin)
 */
const createShow = async (req, res, next) => {
  try {
    const { movieId, theatreId, screenName, date, time, pricing } = req.body;

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Verify theatre and screen exist
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const screen = theatre.screens.find((s) => s.name === screenName);
    if (!screen) {
      return res.status(400).json({
        success: false,
        message: `Screen "${screenName}" not found in theatre "${theatre.name}".`,
      });
    }

    // Create the show
    const show = await Show.create({
      movieId,
      theatreId,
      screenName,
      date,
      time,
      pricing,
    });

    // Auto-generate seats based on screen configuration
    const seats = await SeatService.generateSeatsForShow(show._id, screen);

    res.status(201).json({
      success: true,
      data: {
        show,
        seatsGenerated: seats.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a show
 * @route   PUT /api/shows/:id
 * @access  Private (admin)
 */
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    const allowedFields = ['date', 'time', 'pricing', 'status'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        show[field] = req.body[field];
      }
    }

    await show.save();

    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a show (cancel it + remove seats)
 * @route   DELETE /api/shows/:id
 * @access  Private (admin)
 */
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Cancel the show
    show.status = 'cancelled';
    await show.save();

    // Remove all unbooked seats for this show
    await Seat.deleteMany({
      showId: show._id,
      status: { $in: ['available', 'locked'] },
    });

    res.status(200).json({
      success: true,
      message: 'Show cancelled and available seats removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getShows, createShow, updateShow, deleteShow };
