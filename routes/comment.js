const express = require('express');
const { updateComment, deleteComment, likeComment } = require('../controllers/comment');

const { protect, authorize } = require('../middleware/auth');

const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

router.route('/:id').put(protect, authorize('admin', 'publisher'), updateComment).delete(protect, authorize('admin', 'publisher'), deleteComment);
router.route('/:id/like').put(protect, authorize('admin', 'publisher'), likeComment);

module.exports = router;