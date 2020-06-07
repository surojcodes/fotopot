const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost } = require('../controllers/post');
const router = express.Router();

router.route('/').get(getPosts).post(createPost);
router.route('/:id').get(getPost).put(updatePost).delete(deletePost);

module.exports = router;