const mongoose = require('mongoose');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// Get all contacts
exports.getAllContacts = async (request, reply) => {
    try {
        const user = request.user;

        const contacts = await Promise.all(user.contacts.map(async (contact) => {
            const { contactId, balance } = contact;
            const user = await User.findOne({ _id: contactId }).select('name');
            const name = user ? user.name : ''; // Handle the case when user is not found

            const contactData = {
                contactId: contactId,
                name: name,
                balance: balance,
            };

            return contactData;
        }));

        return reply.status(200).send(contacts);

    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

// Delete a contact
exports.deleteContact = async (request, reply) => {
    let session;
    try {
        const user = request.user;
        const contactId = request.params.contactId;

        const contactIndex = user.contacts.findIndex(contact => contact.contactId.toString() === contactId);

        if (contactIndex === -1) {
            return reply.status(404).send({ message: 'Contact not found' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const transactions = user.contacts[contactIndex].transactions;

        for (let i = 0; i < transactions.length; i++) {
            const transaction = await Transaction.findOne({ _id: transactions[i] }).session(session);
            if (!transaction) {
                await session.abortTransaction();
                await session.endSession();
                return reply.status(500).send({ message: 'Internal server error' });
            }
            await transaction.deleteOne({ _id: transaction }).session(session);
        }

        let amountChange = -user.contacts[contactIndex].balance;
        user.netBalance += amountChange;
        user.contacts.splice(contactIndex, 1);

        const contact = await User.findOne({ _id: contactId }).session(session);
        const userIndexInContact = contact.contacts.findIndex(contact => contact.contactId.toString() === user._id.toString());

        amountChange = -contact.contacts[userIndexInContact].balance;
        contact.netBalance += amountChange;
        contact.contacts.splice(userIndexInContact, 1);

        await user.save({ session });
        await contact.save({ session });

        await session.commitTransaction();
        await session.endSession();

        return reply.status(200).send({ message: 'Contact deleted successfully' });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};
