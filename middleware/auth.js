const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(
    async (req, res, next) => {
        //GET TOKEN FROM REQUEST
        let token = '';
        //if the token is sent through the HTTP headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // console.log('READING TOKEN FROM HEADER');
            token = req.headers.authorization.split(' ')[1];
        }
        //if the token is sent through cookie
        else if (req.cookies && req.cookies.token) {
            console.log(req.cookies);
            token = req.cookies.token;
        }
        if (!token) {
            // console.log('NO TOKEN');
            return next(new ErrorResponse(`Not Authorized to access this route`, 401));
        }

        //VERIFY TOKEN
        try {
            //decode the sent jwt token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //get user id from the decoded token and find the user in db
            //set the user in req.user ! IMPORTANT
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            return next(new ErrorResponse(`Not Authorized to access this route`, 401));
        }


    }
);

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role '${req.user.role}' is not authorized to access this route`, 401));
        }
        next();
    }
}