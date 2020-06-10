const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

//USE : To get all users 
//ROUTE : GET /api/v1/auth/users
//ACCESS : Protected (admin)
exports.getUsers = asyncHandler(
    async (req, res, next) => {
        res.status(200).json(res.advancedResults)
    }
);

//USE : To get a user account
//ROUTE : GET /api/v1/auth/users/:id
//ACCESS : Protected (admin)
exports.getUser = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.params.id).populate({
            path: 'posts',
            select: 'caption'
        });
        if (!user)
            return next(new ErrorResponse(`User with ID ${req.params.id} does not exist.`, 404));
        res.status(200).json({
            success: true,
            data: user
        })
    }
);

//USE : To update a user account
//ROUTE : PUT /api/v1/auth/users/:id
//ACCESS : Protected (admin and the account owner)
exports.updateUser = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user)
            return next(new ErrorResponse(`User with ID ${req.params.id} does not exist.`, 404));

        //check if the  logged in user is account owner or admin
        if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse(`Not authorized to update this user detail.`, 401));
        }
        // check if update is trying to change the role which is not permitted
        if (req.body.role) {
            return next(new ErrorResponse(`Cannot change user role.`, 401));
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: updatedUser
        })
    }
);

//USE : To delete a user account
//ROUTE : DELETE /api/v1/auth/users/:id
//ACCESS : Protected (admin and the account owner)
exports.deleteUser = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user)
            return next(new ErrorResponse(`User with ID ${req.params.id} does not exist.`, 404));

        //check if the  logged in user is account owner or admin
        if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse(`Not authorized to update this user detail.`, 401));
        }
        user.remove();
        res.status(200).json({
            success: true,
            data: {}
        })
    }
);
