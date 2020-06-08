const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost, uploadImage } = require('../controllers/post');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/').get(getPosts).post(protect, createPost);
router.route('/:id').get(getPost).put(protect, updatePost).delete(protect, deletePost);
router.route('/:id/image').put(protect, uploadImage);

module.exports = router;