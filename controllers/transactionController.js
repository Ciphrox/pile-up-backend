const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types

const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

exports.createTransaction = async (req, res) => {
    let session;
    try {
        if (!req.body.sessionToken) {
            return res.status(400).send({ message: 'sessionToken Missing' });
        }

        if (!req.body.amount || !req.body.recieverNumber || !req.body.transactionType) {
            return res.status(400).send({ message: 'Incomplete request' });
        }

        const { sessionToken, amount, recieverNumber, transactionType, description } = req.body;


        session = await mongoose.startSession();
        session.startTransaction();

        const sender = await User.findOne({ sessionToken: sessionToken }).session(session);
        const reciever = await User.findOne({ number: recieverNumber }).session(session);


        if (!sender || !reciever) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({ message: 'Invalid request' });
        }

        if (reciever.sessionToken === sessionToken) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({ message: 'You cannot send money to yourself' });
        }

        if (![ 'request', 'payback' ].includes(transactionType)) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({ message: 'Invalid transaction type' });
        }


        if (transactionType === 'payback') {
            const contact = sender.contacts.find(contact => contact.contactId.toString() === reciever._id.toString());
            if (!contact || contact.balance <= 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).send({ message: 'Can\'t payback, No request' });

            }
        }



        const transaction = new Transaction({
            senderId: sender._id,
            recieverId: reciever._id,
            amount: amount,
            description: description,
            transactionType: transactionType,
        })

        await transaction.save({ session: session });


        const updateConctactinUser = async (user, contactId, transaction, session) => {
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
                const test = await User.findOne({ _id: user._id })
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
                )
            }
        }


        await updateConctactinUser(sender, reciever._id, transaction);
        await updateConctactinUser(reciever, sender._id, transaction);


        await session.commitTransaction();
        return res.status(200).send({ message: 'Transaction successful' });

    }
    catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
}

exports.deleteTransaction = async (req, res) => {
    try {
        const { sessionToken, transactionId } = req.params;
        if (!sessionToken || !transactionId) {
            return res.status(400).send({ message: 'Incomplete request' });
        }

        if (!ObjectId.isValid(transactionId)) {
            return res.status(400).send({ message: 'Invalid transactionId' });
        }


        session = await mongoose.startSession();
        session.startTransaction();


        const user = await User.findOne({ sessionToken: sessionToken }).session(session);
        if (!user) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({ message: 'Invalid sessionToken' });
        }


        const transaction = await Transaction.findOne({ _id: transactionId }).session(session);
        if (!transaction) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({ message: 'transactionId not found' });
        }

        if (transaction.senderId.toString() !== user._id.toString()) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(401).send({ message: 'Unauthorized' });
        }

        const reciever = await User.findOne({ _id: transaction.recieverId }).session(session);

        const updateConctactinUser = async (user, contactId, transaction, session) => {
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

        }

        await updateConctactinUser(user, reciever._id, transaction, session);
        await updateConctactinUser(reciever, user._id, transaction, session);

        await Transaction.deleteOne({ _id: transactionId }).session(session);


        await session.commitTransaction();
        return res.status(200).send({ message: 'Transaction deleted successfully' });

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
}