// Wallet Routes
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// Create wallets
router.post('/create-wallets', walletController.createWallets);

// Get all wallets
router.get('/', walletController.getAllWallets);

// Get a specific wallet by ID
router.get('/:id', walletController.getWalletById);

module.exports = router;