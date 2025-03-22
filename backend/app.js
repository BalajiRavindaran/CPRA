require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package
const walletRoutes = require('./routes/wallet.routes');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/wallets', walletRoutes);
app.use('/transactions', transactionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});