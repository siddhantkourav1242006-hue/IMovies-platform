/**
 * iMovies - Admin Routes
 * GET /api/admin/stats
 */
const express = require('express');
const { getStats } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireRole('admin'));

// Dashboard stats
router.get('/stats', getStats);

module.exports = router;
