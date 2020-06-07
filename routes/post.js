const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost, uploadImage } = require('../controllers/post');
const router = express.Router();

router.route('/').get(getPosts).post(createPost);
router.route('/:id').get(getPost).put(updatePost).delete(deletePost);
router.route('/:id/image').put(uploadImage);

module.exports = router;