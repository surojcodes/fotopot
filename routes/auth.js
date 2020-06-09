const express = require('express');
const { register, uploadProfilePic, getMe, login, logout, forgotPassword, resetPassword, verifyAccount, resendVerification } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/user-image', protect, uploadProfilePic);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.put('/verify-account/:verifyToken', verifyAccount);
router.put('/resend-verification-email', protect, resendVerification);


module.exports = router;