const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    number: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        code: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
    },
    sessionToken: {
        type: String,
        unique: true
    },

},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;