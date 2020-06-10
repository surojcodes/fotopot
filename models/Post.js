const mongoose = require('mongoose');
const User = require('../models/User');

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        trim: true
    },
    image: String,
    tags: [String],
    likes: {
        type: [mongoose.Schema.ObjectId],
        ref: User
    },
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

// delete comments when post is deleted (also delete the image)
PostSchema.pre('remove', async function (next) {
    await this.model('Comment').deleteMany({ post: this._id });
    next();
});

module.exports = mongoose.model('Post', PostSchema);