const mongoose = require('mongoose');
const fs = require('fs');
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
    const post_image = this.image;
    if (post_image) {
        fs.unlink(`${__dirname}/../public/userPosts/${post_image}`, err => {
            if (err) {
                console.log(err);
            }
        })
    }
    next();
});

module.exports = mongoose.model('Post', PostSchema);