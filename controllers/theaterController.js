const Theater = require('../models/Theater');

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
exports.getTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find();
    res.json({ success: true, data: theaters });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theater
// @route   GET /api/theaters/:id
// @access  Public
exports.getTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    res.json({ success: true, data: theater });
  } catch (err) {
    next(err);
  }
};

// @desc    Create theater
// @route   POST /api/theaters
// @access  Private (Admin)
exports.createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, data: theater });
  } catch (err) {
    next(err);
  }
};
