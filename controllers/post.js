const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
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
        let post = await Post.findById(req.params.id);
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 404));
        }
        // check if image is uploaded
        if (!req.files)
            return next(new ErrorResponse(`Please upload an image to the post.`, 400));

        const file = req.files.files;
        // check the mime type of file uploaded
        if (!file.mimetype.startsWith('image'))
            return next(new ErrorResponse(`Please upload an 'image' file.`, 400));

        // check the file size
        if (file.size > process.env.FILE_UPLOAD_LIMIT)
            return next(new ErrorResponse(`File size exceeds its limit of ${process.env.FILE_UPLOAD_LIMIT}.`, 400));

        // create custom name for file
        const nameToStore = `upload-${post._id}${path.parse(file.name).ext}`

        //store it in public/userPosts
        file.mv(`${process.env.FILE_UPLOAD_PATH}/${nameToStore}`, async err => {
            if (err) {
                return next(new ErrorResponse(`Internal Server Error in image uploading`, 500));
            }
            // store imageName in db
            await Post.findByIdAndUpdate(req.params.id, { image: nameToStore });
            res.status(200).json({ success: true, data: nameToStore });
        })
    }
);