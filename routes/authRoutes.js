// Import required Fastify plugins
const { requestOtp, verifyOtp, setName } = require('../controllers/authController');

async function authRoutes(fastify, options) {
    fastify.post('/request-otp', requestOtp);
    fastify.post('/verify-otp', verifyOtp);
}

module.exports = authRoutes;
