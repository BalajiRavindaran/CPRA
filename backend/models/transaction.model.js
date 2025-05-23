const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true }, // Associate transaction with user_id
    sender_id: { type: String, required: true, index: true },
    receiver_id: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    risk: { type: Number, required: true },
    flagged: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);