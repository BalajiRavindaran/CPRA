const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    balance: { type: Number, default: 100 },
    risk_score: { type: Number, default: 0.5 },
    flagged: { type: Boolean, default: false }, // Indicates if the wallet is flagged
    allowRiskDecay: { type: Boolean, default: true }, // Controls risk decay behavior
    risk_score_history: [{
        timestamp: { type: Date, default: Date.now },
        previous_risk_score: { type: Number }, // Add previous risk score
        risk_score: { type: Number },
        change: { type: String, enum: ['up', 'down', 'neutral'] },
        transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
    }],
    transaction_history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    connected_wallets: [{ type: String, ref: 'Wallet' }]
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);