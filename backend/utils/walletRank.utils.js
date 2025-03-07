const Wallet = require("../models/wallet.model");
const Transaction = require("../models/transaction.model");

async function calculateWalletRank({
  dampingFactor = 0.85,
  iterations = 20,
  riskThreshold = 75,
  transactionWeight = 0.5,
  walletsToUpdate = [],
}) {
  const allWallets = await Wallet.find({});
  const numWallets = allWallets.length;

  // Only update specified wallets or all if empty
  const wallets =
    walletsToUpdate.length > 0
      ? allWallets.filter((w) => walletsToUpdate.includes(w.id))
      : allWallets;

  let riskScores = {};
  allWallets.forEach((wallet) => {
    riskScores[wallet.id] = wallet.risk_score || 0.5; // Default to 0.5 if undefined
  });

  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1} of ${iterations}`);
    let newScores = {};

    for (const wallet of wallets) {
      let incomingRisk = 0;
      const incomingTransactions = await Transaction.find({
        receiver_id: wallet.id,
      });

      if (incomingTransactions.length === 0) {
        newScores[wallet.id] = (1 - dampingFactor) / numWallets; // No incoming risk
        continue;
      }

      for (const tx of incomingTransactions) {
        const sender = await Wallet.findOne({ id: tx.sender_id });
        if (!sender || !tx.amount || tx.amount <= 0) continue; // Skip invalid transactions

        const outgoingCount = await Transaction.countDocuments({
          sender_id: sender.id,
        });
        if (outgoingCount > 0) {
          const normalizedAmount = Math.log(tx.amount + 1); // Logarithmic scaling
          const weightedRisk =
            riskScores[sender.id] * (normalizedAmount * transactionWeight);
          incomingRisk += weightedRisk / outgoingCount;

          console.log(
            `Wallet ${wallet.id} received risk from Wallet ${sender.id}:`
          );
          console.log(`  Sender risk score: ${riskScores[sender.id]}`);
          console.log(`  Normalized amount: ${normalizedAmount}`);
          console.log(
            `  Weighted risk contribution: ${weightedRisk / outgoingCount}`
          );
        }
      }

      newScores[wallet.id] =
        (1 - dampingFactor) / numWallets + dampingFactor * incomingRisk;
      newScores[wallet.id] = Math.min(
        1,
        Math.max(0, newScores[wallet.id] || 0)
      ); // Clamp to [0, 1]

      console.log(`Updated risk score for Wallet ${wallet.id}:`);
      console.log(`  Previous score: ${riskScores[wallet.id]}`);
      console.log(`  New score: ${newScores[wallet.id]}`);
    }

    riskScores = newScores;
  }

  // Update wallets with new risk scores
  for (const wallet of wallets) {
    const previousRiskScore = wallet.risk_score || 0.5; // Default to 0.5 if undefined
    const newRiskScore = riskScores[wallet.id];

    // Determine the change in risk score
    const change =
      newRiskScore > previousRiskScore
        ? "up"
        : newRiskScore < previousRiskScore
        ? "down"
        : "neutral";

    // Update wallet fields
    wallet.risk_score = newRiskScore;
    wallet.risk_level = newRiskScore >= riskThreshold / 100 ? "high" : "low";

    // Save risk score history with previous risk score
    wallet.risk_score_history.push({
      timestamp: new Date(),
      previous_risk_score: previousRiskScore, // Add previous risk score
      risk_score: newRiskScore, // Add new risk score
      change, // Direction of change
    });

    await wallet.save();

    console.log(`Final risk score for Wallet ${wallet.id}: ${newRiskScore}`);
  }
}

module.exports = { calculateWalletRank };
