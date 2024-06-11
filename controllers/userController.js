const Transaction = require('../models/transactionModel');
const { ObjectId } = require('mongoose').Types;

exports.handleTransactions = async (req, res) => {
    const transactionId = req.params.transactionId;

    if (transactionId) {
        return await getNewTransations(req, res);
    }

    return await getAllTransactions(req, res);
}

const getNewTransations = async (req, res) => {
    try {
        const user = req.user;
        const { contactId, transactionId } = req.params;

        if (!contactId || !transactionId || !ObjectId.isValid(transactionId)) {
            return res.status(400).send({ message: 'Invalid request' });
        }

        const contact = user.contacts.find(contact => contact.contactId.toString() === contactId);
        const transaction = await Transaction.findOne({ _id: transactionId })?.select('date').lean();

        if (!contact) {
            return res.status(404).send({ message: 'Contact not found' });
        }

        if (!transaction) {

            return res.status(404).send({ message: 'Transaction not found' });
        }

        const lastTransactionTime = transaction.date;

        const newTransactions = await Promise.all(contact.transactions.map(async (transactionId) => {
            const transaction = await Transaction.findOne({ _id: transactionId });

            if (transaction.date > lastTransactionTime) {
                console.log(transaction)
                return transaction;
            }
        }));

        const newCleanTransactions = newTransactions.filter(transaction => transaction);

        return res.status(200).send(newCleanTransactions);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server Error' })
    }
}




const getAllTransactions = async (req, res) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;

        if (!contactId) {
            return res.status(400).send({ message: 'Invalid request' });
        }

        const contact = user.contacts.find(contact => contact.contactId.toString() === contactId);

        if (!contact) {
            return res.status(404).send({ message: 'Contact not found' });
        }

        let transactions = contact.transactions;

        transactions = await Promise.all(contact.transactions.map(async (transaction) => {
            transaction = await Transaction.findOne({ _id: transaction });

            return transaction;
        }));

        return res.status(200).send(transactions);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
}
