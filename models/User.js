const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a name.']
    },
    email: {
        type: String,
        required: [true, 'Please add an email.'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password.'],
        minlength: [6, 'Please set a password longer than 6 characters. '],
        select: false,
    },
    address: String,
    image: String,
    role: {
        type: String,
        enum: ['publisher', 'admin'],
        default: 'publisher'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// encrypt pwd using bcrypt
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// sign a JWT Token
UserSchema.methods.getSingedJWTToken = function (user, statusCode, res) {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}

// for checking password match in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema)