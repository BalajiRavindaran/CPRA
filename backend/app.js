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

// Middleware to dynamically set the database based on x-user-id header
app.use((req, res, next) => {
    const userId = req.header('x-user-id');
    if (!userId) {
        return res.status(400).send('x-user-id header is required');
    }

    const dbName = `db_${userId}`; // Database name based on user_id
    const dbUri = process.env.MONGO_URI.replace(/\/[^/]+$/, `/${dbName}`); // Replace the database name in the URI

    mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(`Connected to MongoDB database: ${dbName}`);
        next();
    }).catch(err => {
        console.error('MongoDB connection error:', err);
        res.status(500).send('Database connection error');
    });
});

// Routes
app.use('/wallets', walletRoutes);
app.use('/transactions', transactionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});