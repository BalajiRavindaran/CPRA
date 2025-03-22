// Transaction Routes
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// Simulate transactions
router.post('/simulate-transactions', transactionController.simulateTransactions);

// Get all transactions
router.get('/', transactionController.getAllTransactions);

module.exports = router;