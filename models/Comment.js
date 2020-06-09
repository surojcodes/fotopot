const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true,
        required: [true, 'Please add a comment.']
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: Post
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: User
    },
    likes: {
        type: [mongoose.Schema.ObjectId],
        ref: User
    },
    edited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema)