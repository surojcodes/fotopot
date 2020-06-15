const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');

// security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');



//routes
const posts = require('./routes/post');
const auth = require('./routes/auth');
const users = require('./routes/user');
const comments = require('./routes/comment');

// configure to use env variables
dotenv.config({ path: './config/config.env' });

const app = express();

// connecting to db
connectDB();

// body parser
app.use(express.json());

// express file upload
app.use(fileUpload());

// mounting routes
app.use('/api/v1/posts', posts);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/comments', comments);

// cookie parser
app.use(cookieParser());

// sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

// prevnt XSS attacks
app.use(xss());

// rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,     // 10 mins
    max: 100
});
app.use(limiter);

//prevent HTTP param polution
app.use(hpp());

//Enable cors
app.use(cors());

// set static folder for images
app.use(express.static(path.join(__dirname, 'public')));

// custom error handling middlware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server Started in ${process.env.NODE_ENV} mode in port ${PORT}.`);
})

//Handle unhandled promise rejections (e.g authentication error)
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message}`.red.bold);
    //close server and exit the process
    server.close(() => process.exit(1));
})