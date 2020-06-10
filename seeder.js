const mongoose = require('mongoose');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const User = require('./models/User');
const fs = require('fs');
const dotenv = require('dotenv');
const colors = require('colors');

//configure to use env vars
dotenv.config({ path: './config/config.env' });

//connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

//read json file
const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'));
const posts = JSON.parse(fs.readFileSync(`${__dirname}/data/posts.json`, 'utf-8'));
const comments = JSON.parse(fs.readFileSync(`${__dirname}/data/comments.json`, 'utf-8'));


// import into db
const importData = async () => {
    try {
        await User.create(users);
        await Post.create(posts);
        await Comment.create(comments);
        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

// destroy data in db
const deleteData = async () => {
    try {
        await User.deleteMany();
        await Post.deleteMany();
        await Comment.deleteMany();

        console.log('Data Deleted!'.red.inverse);
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

//handle command line args
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}