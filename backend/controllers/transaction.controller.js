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

        const wallets = await Wallet.find({});
        const totalWallets = wallets.length;

        for (let i = 0; i < transactionCount; i++) {
            const sender = wallets[Math.floor(Math.random() * totalWallets)];
            const receiver = wallets[Math.floor(Math.random() * totalWallets)];

            if (sender.id === receiver.id || sender.balance <= 0) continue;

            const amount = Math.min(sender.balance, Math.floor(Math.random() * 10) + 1);

            // Update balances
            sender.balance -= amount;
            receiver.balance += amount;

            // Create transaction
            const newTransaction = await Transaction.create({
                sender_id: sender.id,
                receiver_id: receiver.id,
                amount
            });

            // Update transaction history
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
            const walletsToUpdate = new Set([sender.id, receiver.id]);
            sender.connected_wallets.forEach(id => walletsToUpdate.add(id));
            receiver.connected_wallets.forEach(id => walletsToUpdate.add(id));

            await calculateWalletRank({
                dampingFactor,
                iterations,
                riskThreshold,
                transactionWeight,
                walletsToUpdate: Array.from(walletsToUpdate)
            });

            await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay
        }

        res.status(200).json({ message: 'Simulation completed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};