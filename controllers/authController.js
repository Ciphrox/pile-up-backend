const bcrypt = require('bcryptjs');
const axios = require('axios');

const User = require('../models/userModel');

const env = require('dotenv');
env.config();

const { TWO_FACTOR_API } = process.env;



async function hashData(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function hashMatch(password, hash) {
    return await bcrypt.compare(password, hash);
}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}


exports.requestOtp = async (req, res) => {
    try {

        if (!req.body.number) {
            return res.status(400).send({ message: 'Invalid request' });
        }


        const number = req.body.number.toString();

        const unhashedOTP = generateOtp();
        const otp = await hashData(unhashedOTP.toString());

        console.log(unhashedOTP); //to be removed
        let user = await User.findOne({ number: number });

        const expiresAt = new Date(new Date().getTime() + (5 * 60000));

        if (!user) {
            user = new User({
                number: number,
                otp: {
                    code: otp,
                    expiresAt: expiresAt,
                },

            });
        } else {
            user.otp.code = otp;
            user.otp.expiresAt = expiresAt;
        }

        await user.save()

        // try {
        //     const response = await axios.get(`https://2factor.in/API/V1/${TWO_FACTOR_API}/SMS/${number}/${unhashedOTP}/OTP`);
        // } catch (error) {
        //     console.log(error);
        //     return res.status(500).send({ message: 'Internal server error' });
        // }


        // console.log('OTP sent successfully');
        return res.status(200).send({
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        if (!req.body.number || !req.body.otp || !req.body.sessionToken) {
            return res.status(400).send({ message: 'Invalid request' });
        }

        const number = req.body.number.toString();
        const otp = req.body.otp.toString();
        const sessionToken = req.body.sessionToken;


        const user = await User.findOne({ number: number });

        if (!user) {
            return res.status(404).send({ message: 'User Not Found' });
        }

        if (!user.otp.code) {
            return res.status(401).send({ message: 'OTP not requested' });
        }

        const isOtpCorrect = await hashMatch(otp, user.otp.code)

        if (!isOtpCorrect) {
            return res.status(401).send({ message: 'Incorrect OTP' });
        }

        if (user.otp.expiresAt < new Date().getTime()) {
            return res.status(401).send({ message: 'OTP expired' });
        }

        if (!user.name) {
            isUserNew = true;
        }


        user.otp.code = null;
        user.otp.expiresAt = null;
        user.sessionToken = sessionToken;
        user.save();

        if (!user.name) {
            return res.status(200).send({ message: 'OTP verified successfully', new_user: true });
        }

        return res.status(200).send({ message: 'OTP verified successfully', new_user: false });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }

};

exports.setName = async (req, res) => {
    try {
        const { name, sessionToken } = req.body;

        const user = await User.findOneAndUpdate({ sessionToken }, { name: name }, { new: true });

        if (!user) {
            return res.status(404).send({ message: 'Unauthorized' });
        }

        return res.status(200).send({ message: 'Name set successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
};
