const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const uploadImage = require('../utils/uploadImage');
const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path');

// USE : To get all the posts
// ROUTE: GET /api/v1/posts
exports.getPosts = asyncHandler(
    async (req, res, next) => {
        res.status(200).json(res.advancedResults);
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
        //associate the post with logged in user
        req.body.user = req.user.id;
        // create the post
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


        //check if the post belongs to logged in user
        if (post.user.toString() !== req.user.id)
            return next(new ErrorResponse(`Not allowed to update this post.`, 401));

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
        //check if the post belongs to logged in user
        //Admin can delete any post (e.g if the post doesnot follow the rules)
        if (post.user.toString() !== req.user.id && req.user.role !== 'admin')
            return next(new ErrorResponse(`Not allowed to delete this post.`, 401));

        post.remove();
        res.status(200).json({ success: true, data: {} });
    }
);


// USE : To upload a post image
// ROUTE: PUT /api/v1/posts/:id/image
exports.uploadImage = asyncHandler(
    async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (!post)
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 401));
        //check if the post belongs to logged in user
        if (post.user.toString() !== req.user.id)
            return next(new ErrorResponse(`Not allowed to upload image for this post.`, 401));

        uploadImage(Post, req, res, next, process.env.POST_UPLOAD_PATH, process.env.POST_UPLOAD_LIMIT);
    }
);

// USE : To like a post
// ROUTE: PUT /api/v1/posts/:id/like
exports.likePost = asyncHandler(
    async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (!post)
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 401));

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } }, {
            new: true,
            runValidators: true
        }
        )
        res.status(200).json({
            success: true,
            data: updatedPost
        })
    }
);