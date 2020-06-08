const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost, uploadImage } = require('../controllers/post');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/').get(getPosts).post(protect, authorize('admin', 'publisher'), createPost);
router.route('/:id').get(getPost).put(protect, authorize('admin', 'publisher'), updatePost).delete(protect, authorize('admin', 'publisher'), deletePost);
router.route('/:id/image').put(protect, authorize('admin', 'publisher'), uploadImage);

module.exports = router;