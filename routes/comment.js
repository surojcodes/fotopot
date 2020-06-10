const express = require('express');
const { updateComment, deleteComment, likeUnlikeComment } = require('../controllers/comment');

const { protect, authorize } = require('../middleware/auth');

const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

router.route('/:id').put(protect, authorize('admin', 'publisher'), updateComment).delete(protect, authorize('admin', 'publisher'), deleteComment);
router.route('/:id/like').put(protect, authorize('admin', 'publisher'), likeUnlikeComment);
router.route('/:id/unlike').put(protect, authorize('admin', 'publisher'), likeUnlikeComment);

module.exports = router;
