const Wallet = require('../models/wallet.model');
const { calculateWalletRank } = require('../utils/walletRank.utils');
const faker = require('faker');
const { v4: uuidv4 } = require('uuid');

// Create a new wallet
exports.createWallet = async (req, res) => {
    try {
        const balance = req.body.balance || 0;
        const location = `${faker.address.latitude()}, ${faker.address.longitude()}`;
        const newWallet = new Wallet({
            id: uuidv4(),
            balance,
            location
        });
        await newWallet.save();
        res.status(201).json({ message: 'Wallet created', wallet_id: newWallet.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get wallet details
exports.getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ id: req.params.id });
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// List all wallets
exports.listWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find({});
        res.status(200).json(wallets);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};