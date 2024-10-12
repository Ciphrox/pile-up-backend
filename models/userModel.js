const mongoose = require('mongoose');

// Define the user schema
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
    netBalance: {
        type: Number,
        default: 0
    },
    transactions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    contacts: {
        type: [{
            _id: false,
            contactId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            balance: {
                type: Number,
                default: 0
            },
            transactions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Transaction'
            }]
        }],
        default: []
    }
}, { timestamps: true });

// Index to optimize query operations on user and contact references
userSchema.index({ _id: 1, 'contacts.contactId': 1 }, { unique: true });

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
