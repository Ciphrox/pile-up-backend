// Import required Fastify plugins and middlewares
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getAllContacts, deleteContact } = require("../controllers/contactController");
const { setName, handleTransactions } = require("../controllers/userController");

async function userRoutes(fastify, options) {
    // POST route for setting name
    fastify.post('/set-name', { preHandler: authMiddleware }, setName);

    // GET route for fetching all contacts
    fastify.get('/contacts', { preHandler: authMiddleware }, getAllContacts);

    // DELETE route for deleting a contact
    fastify.delete('/contacts/:contactId', { preHandler: authMiddleware }, deleteContact);

    // GET route for handling transactions (with optional transactionId parameter)
    fastify.get('/contacts/transactions/:contactId/:transactionId?', { preHandler: authMiddleware }, handleTransactions);
}

module.exports = userRoutes;
