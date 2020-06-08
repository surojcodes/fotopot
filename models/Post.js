const mongoose = require('mongoose');
const User = require('../models/User');

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        trim: true
    },
    image: String,
    tags: [String],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: User,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);