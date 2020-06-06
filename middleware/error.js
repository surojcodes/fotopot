const ErrorResponse = require('../utils/ErrorResponse');
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) {
        error = new ErrorResponse(`Duplicate Resource entry is not allowed`, 400);
    }
    if (err.name === 'CastError') {
        error = new ErrorResponse(`Invalid Resource ID`, 404);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
    })

}

module.exports = errorHandler;