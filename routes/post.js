const express = require('express');
const { getPosts } = require('../controllers/post');
const router = express.Router();

router.route('/').get(getPosts);

module.exports = router;