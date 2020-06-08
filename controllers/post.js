const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const uploadImage = require('../utils/uploadImage');
const Post = require('../models/Post');
const path = require('path');

// USE : To get all the posts
// ROUTE: GET /api/v1/posts
exports.getPosts = asyncHandler(
    async (req, res, next) => {
        const posts = await Post.find();
        res.status(200).json({ success: true, count: posts.length, data: posts })
    }
);

// USE : To Get single post
// ROUTE: GET /api/v1/posts/:id
exports.getPost = asyncHandler(
    async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 404));
        }
        res.status(200).json({ success: true, data: post });
    }
);

// USE : To create a new post
// ROUTE: POST /api/v1/posts
exports.createPost = asyncHandler(
    async (req, res, next) => {
        const post = await Post.create(req.body);
        res.status(201).json({ success: true, data: post });
    }
);

// USE : To Update a post
// ROUTE: PUT /api/v1/posts/:id
exports.updatePost = asyncHandler(
    async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 404));
        }
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: updatedPost });
    }
);

// USE : To Delete a post
// ROUTE: DELETE /api/v1/posts/:id
exports.deletePost = asyncHandler(
    async (req, res, next) => {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 404));
        }
        post.remove();
        res.status(200).json({ success: true, data: {} });
    }
);


// USE : To upload a post image
// ROUTE: PUT /api/v1/posts/:id/image
exports.uploadImage = asyncHandler(
    async (req, res, next) => {
        uploadImage(Post, req, res, next, process.env.POST_UPLOAD_PATH, process.env.POST_UPLOAD_LIMIT);
    }
);