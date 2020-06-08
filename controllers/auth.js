const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const uploadImage = require('../utils/uploadImage');

//USE : To register a user
//ROUTE :POST /api/v1/auth/register
exports.register = asyncHandler(
    async (req, res, next) => {
        const user = await User.create(req.body);
        res.status(200).json({
            success: true,
            data: user
        })
    }
);

//USE : To upload profile pic for user
//ROUTE : PUT /api/v1/auth/:id/user-image
exports.uploadProfilePic = asyncHandler(
    async (req, res, next) => {
        uploadImage(User, req, res, next, process.env.PROFILE_PIC_UPLOAD_PATH, process.env.PROFILE_PIC_UPLOAD_LIMIT)
    }
);

//USE : To get user details
//ROUTE : PUT /api/v1/auth/:id/me
exports.userInfo = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ErrorResponse(`User with id ${req.params.id} not found.`, 404));
        }
        res.status(200).json({
            success: true,
            data: user
        })
    }
);