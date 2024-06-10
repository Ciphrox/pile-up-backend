const express = require('express');

const router = express.Router();
const { createTransaction, deleteTransaction } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.delete('/:sessionToken/:transactionId', deleteTransaction);

module.exports = router;