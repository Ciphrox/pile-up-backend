const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = async (request, reply) => {
    try {
        const sessionToken = request.headers['sessiontoken'];

        if (!sessionToken) {
            return reply.status(401).send({ message: 'sessionToken Missing' });
        }

        try {
            const decodedToken = jwt.verify(sessionToken, JWT_SECRET);
            const user = await User.findOne({ _id: decodedToken.userId });

            if (!user) {
                return reply.status(401).send({ message: 'Invalid sessionToken' });
            }

            request.user = user;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.error('Token has expired');
                return reply.status(401).send({ message: 'Token has expired' });
            } else if (error.name === 'JsonWebTokenError') {
                console.error('Invalid token');
                return reply.status(401).send({ message: 'Invalid token' });
            } else {
                console.error('Error verifying token', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }

    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};
