const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost, uploadImage, likePost, addComment, viewComments } = require('../controllers/post');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Post = require('../models/Post');
const Comment = require('../models/Comment');


const router = express.Router();

router.route('/').get(advancedResults(Post, { path: 'user', select: 'name' }), getPosts).post(protect, authorize('admin', 'publisher'), createPost);
router.route('/:id').get(getPost).put(protect, authorize('admin', 'publisher'), updatePost).delete(protect, authorize('admin', 'publisher'), deletePost);
router.route('/:id/image').put(protect, authorize('admin', 'publisher'), uploadImage);
router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, addComment).get(protect, advancedResults(Comment), viewComments);

module.exports = router;