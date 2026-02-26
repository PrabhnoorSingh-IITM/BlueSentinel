const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const functions = require('./index'); // Import the functions from index.js

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Mock Firebase request/response for Railway
const wrapFunction = (fn) => (req, res) => {
    // Firebase functions expect a specific object, but for simple HTTP onRailway we can proxy
    fn(req, res);
};

// Map routes specifically for Railway
app.post('/fallbackLLM', (req, res) => functions.fallbackLLM(req, res));
app.post('/processSensorData', (req, res) => functions.processSensorData(req, res));
app.get('/calculateHealthScore', (req, res) => functions.calculateHealthScore(req, res));

// Health check
app.get('/', (req, res) => res.send('BlueSentinel Backend (Railway) is Active.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Railway Server running on port ${PORT}`);
});
