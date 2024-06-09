const express = require('express');

const router = express.Router();
const { transact } = require('../controllers/transactionController');

router.post('/transact', transact);

module.exports = router;