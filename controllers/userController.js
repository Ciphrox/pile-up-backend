const Transaction = require('../models/transactionModel');
const { ObjectId } = require('mongoose').Types;

// Set user's name
exports.setName = async (request, reply) => {
    try {
        const { name } = request.body;
        if (!name) {
            return reply.status(400).send({ message: 'Invalid request' });
        }

        const user = request.user;

        user.name = name;
        await user.save();

        return reply.status(200).send({ message: 'Name set successfully' });
    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

// Handle transactions
exports.handleTransactions = async (request, reply) => {
    const transactionId = request.params.transactionId;

    if (transactionId) {
        return await getNewTransactions(request, reply);
    }

    return await getAllTransactions(request, reply);
};

// Get new transactions for a contact
const getNewTransactions = async (request, reply) => {
    try {
        const user = request.user;
        const { contactId, transactionId } = request.params;

        if (!contactId || !transactionId || !ObjectId.isValid(transactionId)) {
            return reply.status(400).send({ message: 'Invalid request' });
        }

        const contact = user.contacts.find(contact => contact.contactId.toString() === contactId);
        const transaction = await Transaction.findOne({ _id: transactionId }).select('date').lean();

        if (!contact) {
            return reply.status(404).send({ message: 'Contact not found' });
        }

        if (!transaction) {
            return reply.status(404).send({ message: 'Transaction not found' });
        }

        const lastTransactionTime = transaction.date;

        const newTransactions = await Promise.all(contact.transactions.map(async (transactionId) => {
            const transaction = await Transaction.findOne({ _id: transactionId });

            if (transaction.date > lastTransactionTime) {
                return transaction;
            }
        }));

        const newCleanTransactions = newTransactions.filter(transaction => transaction);

        return reply.status(200).send(newCleanTransactions);
    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: 'Internal server Error' });
    }
};

// Get all transactions for a contact
const getAllTransactions = async (request, reply) => {
    try {
        const user = request.user;
        const { contactId } = request.params;

        if (!contactId) {
            return reply.status(400).send({ message: 'Invalid request' });
        }

        const contact = user.contacts.find(contact => contact.contactId.toString() === contactId);

        if (!contact) {
            return reply.status(404).send({ message: 'Contact not found' });
        }

        let transactions = contact.transactions;

        transactions = await Promise.all(transactions.map(async (transaction) => {
            return await Transaction.findOne({ _id: transaction });
        }));

        return reply.status(200).send(transactions);
    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};
