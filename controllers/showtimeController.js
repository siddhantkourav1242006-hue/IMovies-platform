const Showtime = require('../models/Showtime');
const Theater = require('../models/Theater');

// @desc    Get showtimes grouped by theater for a movie and date
// @route   GET /api/showtimes
// @access  Public
exports.getShowtimes = async (req, res, next) => {
  try {
    const { movieId, date } = req.query;
    let filter = {};

    if (movieId) {
      filter.movie = movieId;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movie', 'title posterUrl duration certification language')
      .populate('theater', 'name location screens')
      .sort({ time: 1 });

    // Group showtimes by theater
    const grouped = {};
    showtimes.forEach((st) => {
      if (!st.theater) return;
      const tId = st.theater._id.toString();
      if (!grouped[tId]) {
        grouped[tId] = {
          theater: {
            _id: st.theater._id,
            name: st.theater.name,
            location: st.theater.location,
          },
          shows: [],
        };
      }
      const screenInfo = st.theater.screens[st.screenIndex] || { name: `Screen ${st.screenIndex + 1}` };
      grouped[tId].shows.push({
        _id: st._id,
        time: st.time,
        date: st.date,
        screenIndex: st.screenIndex,
        screenName: screenInfo.name,
        price: st.price,
        bookedCount: st.bookedSeats.length,
      });
    });

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single showtime detail
// @route   GET /api/showtimes/:id
// @access  Public
exports.getShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('theater');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    res.json({ success: true, data: showtime });
  } catch (err) {
    next(err);
  }
};

// @desc    Get seat map and availability for a showtime
// @route   GET /api/showtimes/:id/seats
// @access  Public
exports.getSeats = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('theater');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    const theater = showtime.theater;
    const screen = theater.screens[showtime.screenIndex] || {
      name: 'Screen 1',
      rows: 10,
      seatsPerRow: 12,
      seatMap: [
        { row: 'A', type: 'vip', seats: 8 },
        { row: 'B', type: 'vip', seats: 8 },
        { row: 'C', type: 'premium', seats: 12 },
        { row: 'D', type: 'premium', seats: 12 },
        { row: 'E', type: 'premium', seats: 12 },
        { row: 'F', type: 'standard', seats: 14 },
        { row: 'G', type: 'standard', seats: 14 },
        { row: 'H', type: 'standard', seats: 14 },
        { row: 'I', type: 'standard', seats: 14 },
        { row: 'J', type: 'standard', seats: 14 },
      ],
    };

    const bookedSet = new Set(showtime.bookedSeats || []);

    // Organize into sections (VIP, Premium, Standard)
    const sections = [
      { type: 'vip', label: 'VIP Recliners', price: showtime.price.vip, rows: [] },
      { type: 'premium', label: 'Premium Class', price: showtime.price.premium, rows: [] },
      { type: 'standard', label: 'Standard Class', price: showtime.price.standard, rows: [] },
    ];

    screen.seatMap.forEach((rowConfig) => {
      const section = sections.find((s) => s.type === rowConfig.type) || sections[2];
      const seats = [];
      for (let i = 1; i <= rowConfig.seats; i++) {
        const label = `${rowConfig.row}${i}`;
        seats.push({
          row: rowConfig.row,
          number: i,
          type: rowConfig.type,
          label,
          isBooked: bookedSet.has(label),
          price: showtime.price[rowConfig.type] || showtime.price.standard,
        });
      }
      section.rows.push({
        row: rowConfig.row,
        seats,
      });
    });

    res.json({
      success: true,
      data: {
        sections: sections.filter((s) => s.rows.length > 0),
        bookedSeats: Array.from(bookedSet),
        price: showtime.price,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create showtime
// @route   POST /api/showtimes
// @access  Private (Admin)
exports.createShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete showtime
// @route   DELETE /api/showtimes/:id
// @access  Private (Admin)
exports.deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    res.json({ success: true, message: 'Showtime deleted' });
  } catch (err) {
    next(err);
  }
};
