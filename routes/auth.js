const express = require('express');
const { register, uploadProfilePic, userInfo } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.put('/:id/user-image', uploadProfilePic);
router.get('/:id/me', userInfo);

module.exports = router;