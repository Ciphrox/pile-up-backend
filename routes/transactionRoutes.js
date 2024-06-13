const express = require('express');

const router = express.Router();
const { createTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createTransaction);
router.delete('/:transactionId', authMiddleware, deleteTransaction);

module.exports = router;