const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = async (req, res, next) => {
    try {
        const sessionToken = req.headers[ 'sessiontoken' ];
        if (!sessionToken) {
            return res.status(401).send({ message: 'sessionToken Missing' });
        }

        try {
            const decodedToken = jwt.verify(sessionToken, JWT_SECRET);
            const user = await User.findOne({ _id: decodedToken.userId });

            if (!user) {
                return res.status(401).send({ message: 'Invalid sessionToken' });
            }

            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.error('Token has expired');
                return res.status(401).send({ message: 'Token has expired' });

            } else if (error.name === 'JsonWebTokenError') {
                console.error('Invalid token');
                return res.status(401).send({ message: 'Invalid token' });

            } else {
                console.error('Error verifying token', error);
                return res.status(500).send({ message: 'Internal server error' });
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });

    }
}

