// Transaction Routes
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/simulate-transactions', transactionController.simulateTransactions);

module.exports = router;