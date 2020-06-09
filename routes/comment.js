const express = require('express');
const { updateComment, deleteComment, likeComment } = require('../controllers/comment');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

router.route('/:id').put(protect, updateComment).delete(protect, deleteComment);
router.route('/:id/like').put(protect, likeComment);

module.exports = router;