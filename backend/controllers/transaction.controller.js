const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const { calculateWalletRank } = require('../utils/walletRank.utils');

exports.simulateTransactions = async (req, res) => {
    try {
        const {
            transactionCount,
            dampingFactor,
            iterations,
            riskThreshold,
            transactionWeight
        } = req.body;

        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'x-user-id header is required' });
        }

        const wallets = await Wallet.find({ user_id: userId }); // Filter wallets by user_id
        const totalWallets = wallets.length;

        for (let i = 0; i < transactionCount; i++) {
            const sender = wallets[Math.floor(Math.random() * totalWallets)];
            const receiver = wallets[Math.floor(Math.random() * totalWallets)];

            // Skip if sender and receiver are the same or sender has no balance
            if (sender.id === receiver.id || sender.balance <= 0) continue;

            const amount = Math.min(sender.balance, Math.floor(Math.random() * 10) + 1);

            // Update balances
            sender.balance -= amount;
            receiver.balance += amount;

            // Create transaction
            const newTransaction = await Transaction.create({
                user_id: userId, // Associate transaction with user_id
                sender_id: sender.id,
                receiver_id: receiver.id,
                amount,
                risk: sender.risk_score > receiver.risk_score
                    ? (sender.risk_score * 0.7) + (receiver.risk_score * 0.3)
                    : (sender.risk_score * 0.3) + (receiver.risk_score * 0.7),
                flagged: sender.flagged || receiver.flagged
            });

            // Update transaction history for sender and receiver
            sender.transaction_history.push(newTransaction._id);
            receiver.transaction_history.push(newTransaction._id);

            // Update connections
            if (!sender.connected_wallets.includes(receiver.id)) {
                sender.connected_wallets.push(receiver.id);
            }
            if (!receiver.connected_wallets.includes(sender.id)) {
                receiver.connected_wallets.push(sender.id);
            }

            await sender.save();
            await receiver.save();

            // Recalculate risk scores for affected wallets
            const directlyAffectedWallets = new Set([sender.id, receiver.id]);
            const indirectlyAffectedWallets = new Set();

            // Add connected wallets to indirectly affected wallets
            sender.connected_wallets.forEach(id => indirectlyAffectedWallets.add(id));
            receiver.connected_wallets.forEach(id => indirectlyAffectedWallets.add(id));

            // Remove directly affected wallets from the indirectly affected set
            directlyAffectedWallets.forEach(id => indirectlyAffectedWallets.delete(id));

            // Update risk scores for directly and indirectly affected wallets
            await calculateWalletRank({
                userId, // Pass userId to scope the operation
                dampingFactor,
                iterations,
                riskThreshold,
                transactionWeight,
                directlyAffectedWallets: Array.from(directlyAffectedWallets),
                indirectlyAffectedWallets: Array.from(indirectlyAffectedWallets),
                transactionId: newTransaction._id // Pass the transaction ID
            });
        }

        res.status(200).json({ message: 'Simulation completed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'x-user-id header is required' });
        }

        const transactions = await Transaction.find({ user_id: userId }); // Filter transactions by user_id
        res.status(200).json(transactions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};