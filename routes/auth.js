const express = require('express');
const { register, uploadProfilePic, getMe, login, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/user-image', protect, uploadProfilePic);
router.get('/me', protect, getMe);


module.exports = router;