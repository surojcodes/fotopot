const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        trim: true
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);