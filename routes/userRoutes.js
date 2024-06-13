const express = require(('express'))

const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware')
const { getAllContacts, deleteContact } = require("../controllers/contactController");
const { setName, handleTransactions } = require("../controllers/userController.js");


router.post('/set-name', authMiddleware, setName);
router.get('/contacts', authMiddleware, getAllContacts);
router.delete('/contacts/:contactId', authMiddleware, deleteContact);

router.get('/contacts/transactions/:contactId/:transactionId?', authMiddleware, handleTransactions);


module.exports = router;