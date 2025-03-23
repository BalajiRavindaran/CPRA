const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const { v4: uuidv4 } = require('uuid');

// Create wallets
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

        const wallets = await Wallet.find({});
        res.status(200).json(wallets);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a specific wallet by ID
exports.getWalletById = async (req, res) => {
    try {
        const { id } = req.params;
        const wallet = await Wallet.findOne({ id });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};