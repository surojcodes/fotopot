const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

// USE : To update a comment
// ROUTE: PUT /api/v1/comments/:id
// ACCESS : Protected (publisher)
exports.updateComment = asyncHandler(
    async (req, res, next) => {
        const comment = await Comment.findById(req.params.id);
        if (!comment)
            return next(new ErrorResponse(`Comment with id ${req.params.id} not found.`, 404));

        //check the owner of comment
        if (req.user.id !== comment.user.toString())
            return next(new ErrorResponse(`Not authorized to edit this comment.`, 401));

        req.body.edited = true;
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: updatedComment
        })
    }
);

// USE : To delete a comment
// ROUTE: DELETE /api/v1/comments/:id
// ACCESS : Protected (publisher and admin)
exports.deleteComment = asyncHandler(
    async (req, res, next) => {
        const comment = await Comment.findById(req.params.id);
        if (!comment)
            return next(new ErrorResponse(`Comment with id ${req.params.id} not found.`, 404));

        //check the owner of comment and if admin logged in 
        if (req.user.id !== comment.user.toString() && req.user.role !== 'admin')
            return next(new ErrorResponse(`Not authorized to delete this comment.`, 401));

        comment.remove();
        res.status(200).json({
            success: true,
            data: {}
        })
    }
);