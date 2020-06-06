const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const Post = require('../models/Post');

// USE : To get all the posts
// ROUTE: GET /api/v1/posts
exports.getPosts = asyncHandler(
    async (req, res) => {
        const posts = await Post.find();
        res.status(200).json({ success: true, count: posts.length, data: posts })
    }
);