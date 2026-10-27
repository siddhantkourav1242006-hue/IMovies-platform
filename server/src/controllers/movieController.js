/**
 * iMovies - Movie Controller
 * CRUD operations for movies, plus listing and search
 */
const Movie = require('../models/Movie');
const slugify = require('slugify');

/**
 * @desc    List movies with filtering (city, genre, language, search)
 * @route   GET /api/movies
 * @access  Public
 */
const getMovies = async (req, res, next) => {
  try {
    const { city, genre, language, search, status } = req.query;
    const filter = {};

    // Filter by status (default: now_showing)
    if (status) {
      filter.status = status;
    }

    // Filter by city
    if (city) {
      filter.cities = { $in: [city] };
    }

    // Filter by genre
    if (genre) {
      filter.genre = { $in: genre.split(',').map((g) => g.trim()) };
    }

    // Filter by language
    if (language) {
      filter.language = language;
    }

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const movies = await Movie.find(filter).sort({ releaseDate: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured movies
 * @route   GET /api/movies/featured
 * @access  Public
 */
const getFeaturedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({
      featured: true,
      status: { $in: ['now_showing', 'coming_soon'] },
    }).sort({ releaseDate: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get movie by slug
 * @route   GET /api/movies/:slug
 * @access  Public
 */
const getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a movie
 * @route   POST /api/movies
 * @access  Private (admin)
 */
const createMovie = async (req, res, next) => {
  try {
    const {
      title, synopsis, genre, language, duration,
      rating, releaseDate, posterColor, posterShape,
      featured, cities, status,
    } = req.body;

    // Check for duplicate slug
    const slug = slugify(title, { lower: true, strict: true });
    const existing = await Movie.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A movie with a similar title already exists.',
      });
    }

    const movie = await Movie.create({
      title, synopsis, genre, language, duration,
      rating, releaseDate, posterColor, posterShape,
      featured, cities, status,
    });

    res.status(201).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a movie
 * @route   PUT /api/movies/:id
 * @access  Private (admin)
 */
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'synopsis', 'genre', 'language', 'duration',
      'rating', 'releaseDate', 'posterColor', 'posterShape',
      'featured', 'cities', 'status',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        movie[field] = req.body[field];
      }
    }

    await movie.save(); // Triggers pre-save slug generation

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a movie (soft-delete by archiving)
 * @route   DELETE /api/movies/:id
 * @access  Private (admin)
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Soft delete: change status to archived
    movie.status = 'archived';
    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
};
