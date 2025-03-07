const Wallet = require('../models/wallet.model');
const { v4: uuidv4 } = require('uuid');

exports.createWallets = async (req, res) => {
  try {
    const { walletCount, riskyWalletCount } = req.body;

    // Generate low-risk wallets
    for (let i = 0; i < walletCount - riskyWalletCount; i++) {
      await Wallet.create({
        id: uuidv4(),
        balance: 100,
        risk_score: Math.random() * 0.3
      });
    }

    // Generate high-risk wallets
    for (let i = 0; i < riskyWalletCount; i++) {
      await Wallet.create({
        id: uuidv4(),
        balance: 100,
        risk_score: 0.7 + Math.random() * 0.3
      });
    }

    res.status(201).json({ message: 'Wallets created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};