const mongoose = require('mongoose');

// Define the schema for transactions
const transactionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: ''
    },
    transactionType: {
        type: String,
        enum: ['request', 'payback'],
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
});

// Define an index to optimize queries
transactionSchema.index({ senderId: 1, recieverId: 1, date: -1 });

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
