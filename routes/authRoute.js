const express = require('express');

const router = express.Router();

const { requestOtp, verifyOtp, setName } = require('../controllers/auth');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/set-name', setName);

module.exports = router;

