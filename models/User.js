const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
        default: 'publisher'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// encrypt pwd using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
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
UserSchema.methods.getResetPasswordToken = function () {
    // generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash the token and save in the document
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // set the reset token expire time to 10 mins
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// generate virtual field (reverse populate)
UserSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'user',
    justOne: false
})

module.exports = mongoose.model('User', UserSchema)