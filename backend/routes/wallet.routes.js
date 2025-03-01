const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

router.post('/', walletController.createWallet);
router.get('/:id', walletController.getWallet);
router.get('/', walletController.listWallets);

module.exports = router;