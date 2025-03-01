const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const { calculateWalletRank } = require('../utils/walletRank.utils');

// Create a new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { sender_id, receiver_id, amount } = req.body;

        const sender = await Wallet.findOne({ id: sender_id });
        const receiver = await Wallet.findOne({ id: receiver_id });

        if (!sender || !receiver) {
            return res.status(400).json({ error: 'Invalid sender or receiver' });
        }

        if (sender.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        const newTransaction = new Transaction({ sender_id, receiver_id, amount });
        await newTransaction.save();

        // Recalculate WalletRank
        await calculateWalletRank();

        res.status(201).json({ message: 'Transaction successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};