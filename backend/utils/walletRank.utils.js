const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

async function calculateWalletRank() {
    const wallets = await Wallet.find({});
    const numWallets = wallets.length;

    let riskScores = {};
    wallets.forEach(wallet => {
        riskScores[wallet.id] = wallet.risk_score;
    });

    const dampingFactor = 0.85;
    const threshold = 0.001;
    const maxIterations = 100;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let newScores = {};
        let converged = true;

        for (const wallet of wallets) {
            let incomingRisk = 0;
            const incomingTransactions = await Transaction.find({ receiver_id: wallet.id });

            for (const tx of incomingTransactions) {
                const sender = await Wallet.findOne({ id: tx.sender_id });
                if (sender) {
                    const outgoingTransactions = await Transaction.find({ sender_id: sender.id }).countDocuments();
                    if (outgoingTransactions > 0) {
                        incomingRisk += riskScores[sender.id] / outgoingTransactions;
                    }
                }
            }

            newScores[wallet.id] = (1 - dampingFactor) / numWallets + dampingFactor * incomingRisk;

            if (Math.abs(newScores[wallet.id] - riskScores[wallet.id]) > threshold) {
                converged = false;
            }
        }

        riskScores = newScores;

        if (converged) break;
    }

    // Update risk scores in the database
    for (const wallet of wallets) {
        wallet.risk_score = riskScores[wallet.id];
        await wallet.save();
    }
}

module.exports = { calculateWalletRank };