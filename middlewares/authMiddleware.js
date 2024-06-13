const User = require("../models/userModel");

exports.authMiddleware = async (req, res, next) => {
    try {
        const sessionToken = req.headers[ 'sessiontoken' ];
        if (!sessionToken) {
            return res.status(401).send({ message: 'sessionToken Missing' });
        }

        const user = await User.findOne({ sessionToken: sessionToken });

        if (!user) {
            return res.status(401).send({ message: 'Invalid sessionToken' });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });

    }
}