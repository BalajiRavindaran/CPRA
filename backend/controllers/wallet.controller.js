const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const { v4: uuidv4 } = require('uuid');

exports.createWallets = async (req, res) => {
    try {
        const { walletCount, riskyWalletCount, allowRiskDecay } = req.body;

        // Clear existing wallets and transactions
        await Wallet.deleteMany({});
        await Transaction.deleteMany({});

        // Generate low-risk wallets
        for (let i = 0; i < walletCount - riskyWalletCount; i++) {
            await Wallet.create({
                id: uuidv4(),
                balance: 100,
                risk_score: Math.random() * 0.3, // Low risk (0–0.3)
                flagged: false,
                allowRiskDecay
            });
        }

        // Generate high-risk wallets
        for (let i = 0; i < riskyWalletCount; i++) {
            await Wallet.create({
                id: uuidv4(),
                balance: 100,
                risk_score: 0.7 + Math.random() * 0.3, // High risk (0.7–1.0)
                flagged: true,
                allowRiskDecay
            });
        }

        res.status(201).json({ message: 'Wallets created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};