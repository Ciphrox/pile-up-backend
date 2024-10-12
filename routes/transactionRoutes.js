// Import required Fastify plugins and middlewares
const { createTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

async function transactionRoutes(fastify, options) {
    // POST route for creating transactions
    fastify.post('/', { preHandler: authMiddleware }, createTransaction);

    // DELETE route for deleting transactions
    fastify.delete('/:transactionId', { preHandler: authMiddleware }, deleteTransaction);
}

module.exports = transactionRoutes;
