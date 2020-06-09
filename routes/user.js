const express = require('express');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/user');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const router = express.Router();

router.route('/').get(protect, authorize('admin'), advancedResults(User, { path: 'posts', select: 'caption' }), getUsers);
router.route('/:id').get(protect, authorize('admin'), getUser).put(protect, updateUser).delete(protect, deleteUser);

module.exports = router;