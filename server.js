const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');


//routes
const posts = require('./routes/post');

// configure to use env variables
dotenv.config({ path: './config/config.env' });

const app = express();

// connecting to db
connectDB();

// body parser
app.use(express.json());

// express file upload
app.use(fileUpload());

app.use('/api/v1/posts', posts);

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