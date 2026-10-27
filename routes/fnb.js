const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem } = require('../controllers/fnbController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getItems);
router.post('/', protect, authorize('admin'), createItem);
router.put('/:id', protect, authorize('admin'), updateItem);

module.exports = router;
