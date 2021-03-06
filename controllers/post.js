const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const uploadImage = require('../utils/uploadImage');

const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

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
        const post = await Post.findById(req.params.id).populate({
            path: 'user',
            select: 'name'
        });
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 404));
        }
        // also the comments
        const comments = await Comment.find({ post: req.params.id }).populate({
            path: 'user',
            select: 'name'
        });

        res.status(200).json({ success: true, data: post, comments });
    }
);

// USE : To Get  post of a user
// ROUTE: GET /api/v1/posts/user/:userId
// ACCESS : loggedIn
exports.getUsersPost = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(new ErrorResponse(`User with id ${req.params.userId} not found.`, 404));
        }
        const posts = await Post.find({ user: req.params.userId }).populate({
            path: 'user',
            select: 'name'
        });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
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
        const comments = await Comment.find({ post: req.params.id }).populate({
            path: 'user',
            select: 'name'
        });
        res.status(200).json({ success: true, data: updatedPost, comments });
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

// USE : To like/unlike a post
// ROUTE: PUT /api/v1/posts/:id/like and PUT /api/v1/posts/:id/unlike
exports.likeUnlikePost = asyncHandler(
    async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (!post)
            return next(new ErrorResponse(`Post with id ${req.params.id} not found.`, 401));

        //if no like, add a like
        let query = '';
        const options = {
            new: true,
            runValidators: true
        }
        if (!post.likes.includes(req.user.id)) {
            query = Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } }, options);
        } else {
            //if liked, dislike
            query = Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user.id } }, options);
        }
        const updatedPost = await query;

        res.status(200).json({
            success: true,
            data: updatedPost
        })
    }
);

// USE : To add a comment 
// ROUTE: POST /api/v1/posts/:id/comment
// ACCESS : Protected (publisher and admin)
exports.addComment = asyncHandler(
    async (req, res, next) => {
        req.body.user = req.user.id;
        req.body.post = req.params.id;
        const comment = await Comment.create(req.body);
        res.status(200).json({
            success: true,
            data: comment
        })
    }
);


// USE : Get comments for a post 
// ROUTE: GET /api/v1/posts/:id/comment
// ACCESS : Protected (publisher and admin)
exports.viewComments = asyncHandler(
    async (req, res, next) => {
        let query = Comment.find({ post: req.params.id }).sort('-createdAt');
        const page = parseInt(req.query.page, 10) || 1; //how many pages
        const limit = parseInt(req.query.limit, 10) || 25;     //no of records in each page , by defualt 25
        const startIndex = (page - 1) * limit;
        const endIndex = (page * limit);
        const total = await Comment.countDocuments({ post: req.params.id });

        query = query.skip(startIndex).limit(limit).populate({
            path: 'user',
            select: 'name'
        }).populate({
            path: 'post',
            select: 'caption'
        });

        const comments = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true,
            count: comments.length,
            pagination,
            data: comments
        })
    }
);