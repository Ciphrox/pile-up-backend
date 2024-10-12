const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

// Create a transaction
exports.createTransaction = async (request, reply) => {
    let session;
    try {
        const { amount, recieverNumber, transactionType, description } = request.body;

        if (!amount || !recieverNumber || !transactionType) {
            return reply.status(400).send({ message: 'Incomplete request' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const sender = request.user;
        const reciever = await User.findOne({ number: recieverNumber }).session(session);

        if (!sender || !reciever) {
            await session.abortTransaction();
            await session.endSession();
            return reply.status(400).send({ message: 'Invalid request' });
        }

        if (sender._id.toString() === reciever._id.toString()) {
            await session.abortTransaction();
            await session.endSession();
            return reply.status(400).send({ message: 'You cannot send money to yourself' });
        }

        if (![ 'request', 'payback' ].includes(transactionType)) {
            await session.abortTransaction();
            await session.endSession();
            return reply.status(400).send({ message: 'Invalid transaction type' });
        }

        if (transactionType === 'payback') {
            const contact = sender.contacts.find(contact => contact.contactId.toString() === reciever._id.toString());
            if (!contact || contact.balance <= 0) {
                await session.abortTransaction();
                await session.endSession();
                return reply.status(400).send({ message: 'Can\'t payback, No request' });
            }
        }

        const transaction = new Transaction({
            senderId: sender._id,
            recieverId: reciever._id,
            amount: amount,
            description: description,
            transactionType: transactionType,
        });

        await transaction.save({ session: session });

        const updateContactInUser = async (user, contactId, transaction, session) => {
            const foundContact = user.contacts.find(contact => contact.contactId.toString() === contactId.toString());
            const amountChange = (transaction.senderId.toString() === user._id.toString()) ? -transaction.amount : transaction.amount;

            await user.updateOne({ $inc: { netBalance: amountChange } }, { session: session });

            if (foundContact) {
                await User.updateOne(
                    {
                        _id: user._id,
                        'contacts.contactId': contactId
                    },
                    {
                        $inc: { 'contacts.$.balance': amountChange },
                        $push: { 'contacts.$.transactions': transaction._id }
                    },
                    { session: session }
                );
            } else {
                await User.updateOne({ _id: user._id },
                    {
                        $push: {
                            contacts: {
                                contactId: contactId,
                                balance: amountChange,
                                transactions: [ transaction._id ]
                            }
                        }
                    },
                    { session: session }
                );
            }
        };

        await updateContactInUser(sender, reciever._id, transaction, session);
        await updateContactInUser(reciever, sender._id, transaction, session);

        await session.commitTransaction();
        await session.endSession();

        return reply.status(200).send({ message: 'Transaction successful' });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

// Delete a transaction
exports.deleteTransaction = async (request, reply) => {
    let session;
    try {
        const { transactionId } = request.params;

        if (!transactionId) {
            return reply.status(400).send({ message: 'Incomplete request' });
        }

        if (!ObjectId.isValid(transactionId)) {
            return reply.status(400).send({ message: 'Invalid transactionId' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const user = request.user;
        const transaction = await Transaction.findOne({ _id: transactionId }).session(session);

        if (!transaction) {
            await session.abortTransaction();
            await session.endSession();
            return reply.status(400).send({ message: 'transactionId not found' });
        }

        if (transaction.senderId.toString() !== user._id.toString()) {
            await session.abortTransaction();
            await session.endSession();
            return reply.status(401).send({ message: 'Unauthorized' });
        }

        const reciever = await User.findOne({ _id: transaction.recieverId }).session(session);

        const updateContactInUser = async (user, contactId, transaction, session) => {
            const amountChange = (transaction.senderId.toString() === user._id.toString()) ? transaction.amount : -transaction.amount;

            await user.updateOne({ $inc: { netBalance: amountChange } }, { session: session });
            await User.updateOne(
                {
                    _id: user._id,
                    'contacts.contactId': contactId
                },
                {
                    $inc: { 'contacts.$.balance': amountChange },
                    $pull: { 'contacts.$.transactions': transaction._id }
                },
                { session: session }
            );
        };

        await updateContactInUser(user, reciever._id, transaction, session);
        await updateContactInUser(reciever, user._id, transaction, session);

        await Transaction.deleteOne({ _id: transactionId }).session(session);

        await session.commitTransaction();
        await session.endSession();

        return reply.status(200).send({ message: 'Transaction deleted successfully' });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        console.log(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};
