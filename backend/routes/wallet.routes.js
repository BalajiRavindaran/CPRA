// Wallet Routes
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

router.post('/create-wallets', walletController.createWallets);

module.exports = router;