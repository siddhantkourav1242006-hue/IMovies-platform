/**
 * iMovies - Validation Middleware
 * Wrapper around express-validator to run validations and return errors
 */
const { validationResult } = require('express-validator');

/**
 * Middleware that checks validation results from express-validator chains.
 * Place this after your validation rules in the route definition.
 *
 * Usage:
 *   router.post('/register', [
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 }),
 *     validate,
 *   ], controller.register);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Extract first error message for each field
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
