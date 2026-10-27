/**
 * iMovies - Theatre Controller
 * CRUD operations for theatres
 */
const Theatre = require('../models/Theatre');

/**
 * @desc    List theatres (filter by city)
 * @route   GET /api/theatres
 * @access  Public
 */
const getTheatres = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.city) {
      filter.city = req.query.city;
    }

    const theatres = await Theatre.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a theatre
 * @route   POST /api/theatres
 * @access  Private (admin)
 */
const createTheatre = async (req, res, next) => {
  try {
    const { name, city, address, screens } = req.body;

    const theatre = await Theatre.create({
      name,
      city,
      address,
      screens,
    });

    res.status(201).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a theatre
 * @route   PUT /api/theatres/:id
 * @access  Private (admin)
 */
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const allowedFields = ['name', 'city', 'address', 'screens'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        theatre[field] = req.body[field];
      }
    }

    await theatre.save();

    res.status(200).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a theatre
 * @route   DELETE /api/theatres/:id
 * @access  Private (admin)
 */
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTheatres, createTheatre, updateTheatre, deleteTheatre };
