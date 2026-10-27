const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  getShowtime,
  getSeats,
  createShowtime,
  deleteShowtime,
} = require('../controllers/showtimeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getShowtimes);
router.get('/:id', getShowtime);
router.get('/:id/seats', getSeats);
router.post('/', protect, authorize('admin'), createShowtime);
router.delete('/:id', protect, authorize('admin'), deleteShowtime);

module.exports = router;
