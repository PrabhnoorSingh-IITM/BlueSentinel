const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const functions = require('./index'); // Import the functions from index.js

const app = express();

// Very explicit CORS to satisfy browser preflight checks
app.use(cors({
    origin: true, // Reflect request origin
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Handle preflight specifically
app.options('*', cors());

app.use(express.json());

// Add error handling middleware to prevent server crashes leaking to CORS
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', success: false });
});

// Mock Firebase request/response for Railway
const wrapFunction = (fn) => (req, res) => {
    // Firebase functions expect a specific object, but for simple HTTP onRailway we can proxy
    fn(req, res);
};

// Map routes specifically for Railway
app.post('/fallbackLLM', (req, res) => {
    functions.fallbackLLMLogic(req, res).catch(err => {
        console.error('Route error /fallbackLLM:', err);
        res.status(500).json({ success: false, error: 'Internal logic error' });
    });
});
app.post('/processSensorData', (req, res) => functions.processSensorData(req, res));
app.get('/calculateHealthScore', (req, res) => functions.calculateHealthScore(req, res));

// Health check
app.get('/', (req, res) => res.send('BlueSentinel Backend (Railway) is Active.'));

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Railway Server running on port ${PORT}`);
});
