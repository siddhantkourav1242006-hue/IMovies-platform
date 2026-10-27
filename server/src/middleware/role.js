/**
 * iMovies - Role Guard Middleware
 * Restricts route access to specific roles (e.g., admin)
 */

/**
 * Factory function that returns middleware checking user's role
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // auth middleware must run before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};

module.exports = requireRole;
