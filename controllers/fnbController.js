const FnBItem = require('../models/FnBItem');

// @desc    Get all available F&B items grouped by category
// @route   GET /api/fnb
// @access  Public
exports.getItems = async (req, res, next) => {
  try {
    const items = await FnBItem.find({ isAvailable: true });

    // Group items by category
    const categoriesMap = {
      popcorn: { category: 'popcorn', title: '🍿 Popcorn & Snacks', items: [] },
      beverage: { category: 'beverage', title: '🥤 Beverages & Drinks', items: [] },
      combo: { category: 'combo', title: '🎉 Saver Combos', items: [] },
      snack: { category: 'snack', title: '🍟 Finger Foods', items: [] },
    };

    items.forEach((item) => {
      if (categoriesMap[item.category]) {
        categoriesMap[item.category].items.push(item);
      } else {
        if (!categoriesMap[item.category]) {
          categoriesMap[item.category] = { category: item.category, title: item.category, items: [] };
        }
        categoriesMap[item.category].items.push(item);
      }
    });

    res.json({
      success: true,
      data: {
        categories: Object.values(categoriesMap).filter((cat) => cat.items.length > 0),
        rawItems: items,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create F&B Item
// @route   POST /api/fnb
// @access  Private (Admin)
exports.createItem = async (req, res, next) => {
  try {
    const item = await FnBItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Update F&B Item
// @route   PUT /api/fnb/:id
// @access  Private (Admin)
exports.updateItem = async (req, res, next) => {
  try {
    const item = await FnBItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};
