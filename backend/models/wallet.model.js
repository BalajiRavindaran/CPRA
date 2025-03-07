const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  balance: { type: Number, default: 100 },
  risk_score: { type: Number, default: 0.5 }, // Current risk score
  risk_score_history: [{
    timestamp: { type: Date, default: Date.now },
    previous_risk_score: { type: Number }, // Previous risk score before update
    risk_score: { type: Number },         // New risk score after update
    change: { type: String, enum: ['up', 'down', 'neutral'] } // Change in risk score
  }],
  transaction_history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  connected_wallets: [{ type: String, ref: 'Wallet' }] // Track connections
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);