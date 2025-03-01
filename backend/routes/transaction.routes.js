const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/', transactionController.createTransaction);

module.exports = router;