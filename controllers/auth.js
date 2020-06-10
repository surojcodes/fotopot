const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const uploadImage = require('../utils/uploadImage');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');

//USE : To register a user
//ROUTE :POST /api/v1/auth/register
exports.register = asyncHandler(
    async (req, res, next) => {
        const user = await User.create(req.body);
        //SEND VERIFICATION EMAIL
        sendVerificationEmail(req, user);
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
        if (!req.user)
            return next(new ErrorResponse(`No one is logged in!`, 404));

        const user = await User.findById(req.user.id).populate({
            path: 'posts',
            select: 'caption'
        });
        res.status(200).json({
            success: true,
            data: user
        })
    }
);

//USE : To generate JWT and set cookie
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

//USE : To send email with token for forgot password
//ROUTE : POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(
    async (req, res, next) => {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return next(new ErrorResponse(`User with email ${req.body.email} does not exist.`, 404));

        //get token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        //create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`

        // write a message
        const message = `You are receiving this email because you have requested the reset of a password. Please make a PUT request to ${resetUrl}`

        // send Mail
        try {
            await sendMail({
                email: user.email,
                subject: 'Fotopot Password Reset',
                message
            });
            res.status(200).json({
                success: true,
                data: 'Email Sent'
            });
        } catch (error) {
            // console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorResponse(`Email could not be sent`, 500));
        }
    }
);

//USE : To handle forgot password token received
//ROUTE : PUT /api/v1/auth/reset-password/:resetToken
exports.resetPassword = asyncHandler(
    async (req, res, next) => {

        // hash the received token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        // find user
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) {
            return next(new ErrorResponse(`Invalid Token.`, 400));
        }

        // set new password
        user.password = req.body.password;

        // remove the reset token fields
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;

        // save the user
        await user.save();

        //log in the user
        sendTokenResponse(user, 200, res);
    }
);


//USE : To verify account
//ROUTE : PUT /api/v1/auth/verify-account/:verifyToken
exports.verifyAccount = asyncHandler(
    async (req, res, next) => {

        // hash the received token
        const accountVerificationToken = crypto.createHash('sha256').update(req.params.verifyToken).digest('hex');

        // find user
        const user = await User.findOne({ accountVerificationToken, accountVerificationExpire: { $gt: Date.now() } });
        if (!user) {
            return next(new ErrorResponse(`Invalid Token.`, 400));
        }

        // set new password
        user.role = 'publisher';

        // remove the reset token fields
        user.accountVerificationToken = undefined;
        user.accountVerificationExpire = undefined;

        // save the user
        await user.save();

        // write a message
        const message = `Congratulation, your fotopot account has been activated. You can now post images, like content and comment on them`

        // send account sucesfully verified Mail
        try {
            await sendMail({
                email: user.email,
                subject: 'Fotopot Account Verification Successful',
                message
            });
        } catch (error) {
            // console.log(error);
            return next(new ErrorResponse(`Email could not be sent`, 500));
        }

        //log in the user
        sendTokenResponse(user, 200, res);
    }
);

//USE : To request resend of verify token
//ROUTE : PUT /api/v1/auth/resend-verification-email
//ACCESS: protected
exports.resendVerification = asyncHandler(
    async (req, res, next) => {

        const user = await User.findById(req.user.id);
        // console.log(user);
        if (!user) {
            return next(new ErrorResponse(`Please log in to continue`, 401));
        }
        if (user.role === 'publisher' || user.role === 'admin') {
            return next(new ErrorResponse(`You are already verified`, 400));
        }
        sendVerificationEmail(req, user);
        //log in the user
        sendTokenResponse(user, 200, res);
    }
);

// Send verification email
const sendVerificationEmail = async (req, user) => {

    // get the token
    const verifyToken = user.getAccountVerificationToken();
    await user.save({ validateBeforeSave: false });

    //create verification url
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-account/${verifyToken}`

    // write a message
    const message = `You are receiving this email because you signed up with fotopot. 
        For posting images,liking posts and comments, please verify your account by making a PUT request to ${verifyUrl}`

    // send Mail
    try {
        await sendMail({
            email: user.email,
            subject: 'Fotopot Account Verification',
            message
        });
    } catch (error) {
        // console.log(error);
        user.accountVerificationToken = undefined;
        user.accountVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse(`Email could not be sent`, 500));
    }
}