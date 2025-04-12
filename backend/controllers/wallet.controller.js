const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const { v4: uuidv4 } = require('uuid');

// Create wallets
exports.createWallets = async (req, res) => {
    try {
        const { walletCount, riskyWalletCount, allowRiskDecay } = req.body;
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'x-user-id header is required' });
        }

        // Clear existing wallets and transactions for the user
        await Wallet.deleteMany({ user_id: userId });
        await Transaction.deleteMany({ user_id: userId });

        // Generate low-risk wallets
        for (let i = 0; i < walletCount - riskyWalletCount; i++) {
            await Wallet.create({
                user_id: userId, // Associate wallet with user_id
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
                user_id: userId, // Associate wallet with user_id
                id: uuidv4(),
                balance: 100,
                risk_score: 0.75 + Math.random() * 0.25, // High risk (0.7–1.0)
                flagged: true,
                allowRiskDecay
            });
        }

        const wallets = await Wallet.find({ user_id: userId });
        res.status(200).json(wallets);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all wallets
exports.getAllWallets = async (req, res) => {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'x-user-id header is required' });
        }

        const wallets = await Wallet.find({ user_id: userId }); // Filter wallets by user_id
        res.status(200).json(wallets);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a specific wallet by ID
exports.getWalletById = async (req, res) => {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'x-user-id header is required' });
        }

        const { id } = req.params;
        const wallet = await Wallet.findOne({ id, user_id: userId }); // Filter wallet by id and user_id

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};