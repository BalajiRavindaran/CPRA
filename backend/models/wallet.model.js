const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    location: { type: String, required: true }, // Latitude, Longitude
    risk_score: { type: Number, default: 0.5 }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);