const express = require('express');
const router = express.Router();
const { getTheaters, getTheater, createTheater } = require('../controllers/theaterController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTheaters);
router.get('/:id', getTheater);
router.post('/', protect, authorize('admin'), createTheater);

module.exports = router;
