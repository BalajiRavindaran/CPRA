const Wallet = require("../models/wallet.model");
const Transaction = require("../models/transaction.model");

async function calculateWalletRank({
    dampingFactor = 0.85,
    iterations = 20,
    riskThreshold = 75,
    transactionWeight = 0.5,
    walletsToUpdate = []
}) {
    const allWallets = await Wallet.find({});
    const numWallets = allWallets.length;

    // Convert riskThreshold to decimal
    const highRiskThreshold = riskThreshold / 100;

    // Only update specified wallets or all if empty
    const wallets =
        walletsToUpdate.length > 0
            ? allWallets.filter(w => walletsToUpdate.includes(w.id))
            : allWallets;

    let riskScores = {};
    allWallets.forEach(wallet => {
        riskScores[wallet.id] = wallet.risk_score || 0.5; // Default to 0.5 if undefined
    });

    for (let i = 0; i < iterations; i++) {
        let newScores = {};

        for (const wallet of wallets) {
            // Skip updating flagged wallets unless their risk score increases
            if (wallet.flagged && !wallet.allowRiskDecay && riskScores[wallet.id] >= highRiskThreshold) {
                newScores[wallet.id] = riskScores[wallet.id];
                continue;
            }

            let incomingRisk = 0;
            let outgoingRisk = 0;

            // Incoming transactions (receiver logic)
            const incomingTransactions = await Transaction.find({ receiver_id: wallet.id });
            for (const tx of incomingTransactions) {
                const sender = await Wallet.findOne({ id: tx.sender_id });
                if (!sender || !tx.amount || tx.amount <= 0) continue;

                const outgoingCount = await Transaction.countDocuments({ sender_id: sender.id });
                if (outgoingCount > 0) {
                    const normalizedAmount = Math.log(tx.amount + 1); // Logarithmic scaling
                    const weightedRisk = riskScores[sender.id] * (normalizedAmount * transactionWeight);
                    incomingRisk += weightedRisk / outgoingCount;
                }
            }

            // Outgoing transactions (sender logic)
            const outgoingTransactions = await Transaction.find({ sender_id: wallet.id });
            for (const tx of outgoingTransactions) {
                const receiver = await Wallet.findOne({ id: tx.receiver_id });
                if (!receiver || !tx.amount || tx.amount <= 0) continue;

                const incomingCount = await Transaction.countDocuments({ receiver_id: receiver.id });
                if (incomingCount > 0) {
                    const normalizedAmount = Math.log(tx.amount + 1); // Logarithmic scaling
                    const weightedRisk = riskScores[receiver.id] * (normalizedAmount * transactionWeight);
                    outgoingRisk += weightedRisk / incomingCount;
                }
            }

            // Combine incoming and outgoing risks
            const combinedRisk = incomingRisk + outgoingRisk;

            // Normalize risk scores for similar-risk wallets
            newScores[wallet.id] = (1 - dampingFactor) / numWallets + dampingFactor * combinedRisk;
            newScores[wallet.id] = Math.min(1, Math.max(0, newScores[wallet.id])); // Clamp to [0, 1]

            // Normalize risk scores for non-flagged wallets
            if (!wallet.flagged) {
                const neighboringWallets = await Wallet.find({
                    id: { $in: wallet.connected_wallets }
                });
                const neighborScores = neighboringWallets.map(w => w.risk_score);
                const averageNeighborScore = neighborScores.reduce((sum, score) => sum + score, 0) / neighborScores.length || 0;

                // Normalize to the average of the wallet's score and its neighbors' scores
                newScores[wallet.id] = (newScores[wallet.id] + averageNeighborScore) / 2;
            }

            // Flag wallets whose risk score exceeds the threshold
            if (newScores[wallet.id] >= highRiskThreshold) {
                wallet.flagged = true;
            }
        }

        riskScores = newScores;
    }

    // Update wallets with new risk scores
    for (const wallet of wallets) {
        const previousRiskScore = wallet.risk_score || 0.5; // Default to 0.5 if undefined
        const newRiskScore = riskScores[wallet.id];

        const change =
            newRiskScore > previousRiskScore
                ? "up"
                : newRiskScore < previousRiskScore
                    ? "down"
                    : "neutral";

        wallet.risk_score = newRiskScore;
        wallet.risk_level = newRiskScore >= highRiskThreshold ? "high" : "low";

        // Add transaction reference to risk score history
        const lastTransaction = wallet.transaction_history[wallet.transaction_history.length - 1];
        wallet.risk_score_history.push({
            timestamp: new Date(),
            previous_risk_score: previousRiskScore, // Add previous risk score
            risk_score: newRiskScore,
            change,
            transaction_id: lastTransaction
        });

        await wallet.save();
    }
}

module.exports = { calculateWalletRank };