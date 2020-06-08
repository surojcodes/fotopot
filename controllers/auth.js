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
        sendTokenResponse(user, 200, res);
    }
);

//USE : To login a user
//ROUTE : POST /api/v1/auth/login
exports.login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password)
            return next(new ErrorResponse(`Please provide an email and a password`, 400));
        //get the user with provided email
        const user = await User.findOne({ email }).select('+password');
        // if user email doesnot exist in db
        if (!user)
            return next(new ErrorResponse(`Invalid Credentials!`, 401));
        // check the password match via a user method
        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return next(new ErrorResponse(`Invalid Credentials!`, 401));
        sendTokenResponse(user, 200, res);
    }
);
//USE : To logout a user
//ROUTE :POST /api/v1/auth/register
//ACCESS : Protected
exports.logout = asyncHandler(
    async (req, res, next) => {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({ success: true, data: {} });
    }
);



//USE : To upload profile pic for LOGGED IN user
//ROUTE : PUT /api/v1/auth/user-image
//ACCESS : Protected
exports.uploadProfilePic = asyncHandler(
    async (req, res, next) => {
        uploadImage(User, req, res, next, process.env.PROFILE_PIC_UPLOAD_PATH, process.env.PROFILE_PIC_UPLOAD_LIMIT)
    }
);

//USE : To get user details
//ROUTE : PUT /api/v1/auth/:id/me
//ACCESS : Protected
exports.getMe = asyncHandler(
    async (req, res, next) => {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        })
    }
);

const sendTokenResponse = (user, statusCode, res) => {
    //get the signed token from user model method
    const token = user.getSingedJWTToken();
    // for seeting cookie with the token
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true //accessible to the JavaScript Document.cookie API
    }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;  //send to server only if request is through https
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true, token
    })

}