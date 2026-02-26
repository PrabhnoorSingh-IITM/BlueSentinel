const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Exported functions
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from BlueSentinel Firebase Functions!');
});

// Process sensor data
exports.processSensorData = functions.https.onRequest(async (req, res) => {
  try {
    const sensorData = req.body;

    // Validate data
    if (!sensorData.temperature || !sensorData.ph) {
      return res.status(400).json({ error: 'Missing required sensor data' });
    }

    // Add timestamp
    sensorData.timestamp = admin.database.ServerValue.TIMESTAMP;

    // Save to database
    await admin.database().ref('sensors/latest').set(sensorData);
    await admin.database().ref('sensors/history').push(sensorData);

    res.json({ success: true, message: 'Sensor data processed successfully' });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate health score
exports.calculateHealthScore = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await admin.database().ref('sensors/latest').once('value');
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ error: 'No sensor data available' });
    }

    // Simple health score calculation (0-100)
    let score = 100;

    // Temperature penalty (optimal: 20-30°C)
    if (data.temperature < 20 || data.temperature > 30) {
      score -= Math.abs(data.temperature - 25) * 2;
    }

    // pH penalty (optimal: 6.5-8.5)
    if (data.ph < 6.5 || data.ph > 8.5) {
      score -= Math.abs(data.ph - 7.5) * 10;
    }

    // Turbidity penalty (optimal: <5 NTU)
    if (data.turbidity > 5) {
      score -= (data.turbidity - 5) * 3;
    }

    // Dissolved oxygen penalty (optimal: >6 mg/L)
    if (data.dissolvedOxygen < 6) {
      score -= (6 - data.dissolvedOxygen) * 5;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    await admin.database().ref('health/current').set({
      score: score,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      status: score > 70 ? 'Good' : score > 40 ? 'Moderate' : 'Poor'
    });

    res.json({ healthScore: score });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW FUNCTIONS (Phase 2.5) ---

// 1. Get News Proxy (Hides API Key)
exports.getNews = functions.https.onCall(async (data, context) => {
  const apiKey = '74eaee257214422fb35ff737068795a9'; // In prod, use functions.config().news.key
  const query = 'ocean pollution OR marine conservation OR coral reef';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&pageSize=6&sortBy=publishedAt&language=en`;

  try {
    const response = await axios.get(url);
    return response.data.articles.map(article => ({
      title: article.title,
      content: article.description,
      date: article.publishedAt,
      url: article.url,
      source: article.source.name
    }));
  } catch (error) {
    console.error('News API Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch news');
  }
});

// 2. Generate CSV Export
exports.generateCSV = functions.https.onCall(async (data, context) => {
  try {
    const snapshot = await admin.database().ref('sensors/history').limitToLast(1000).once('value');
    const logs = snapshot.val();

    if (!logs) return { csv: '', count: 0 };

    let csv = 'Timestamp,Temperature,pH,Turbidity,DO,Salinity\n';

    Object.values(logs).forEach(log => {
      const date = new Date(log.timestamp).toISOString();
      const temp = log.temperature || '';
      const ph = log.ph || '';
      const turb = log.turbidity || '';
      const doVal = log.dissolvedOxygen || '';
      const sal = log.salinity || '';

      csv += `${date},${temp},${ph},${turb},${doVal},${sal}\n`;
    });

    return { csv: csv, count: Object.keys(logs).length };
  } catch (error) {
    console.error('CSV Generation Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate CSV');
  }
});

// 3. Fallback LLM Proxy (Using HuggingFace Free Inference API)
exports.fallbackLLM = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { prompt, max_tokens } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Using a fast, free conversational model hosted on HuggingFace
      const MODEL = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0';
      const HF_TOKEN = process.env.HF_TOKEN || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (HF_TOKEN) {
        headers['Authorization'] = `Bearer ${HF_TOKEN}`;
      }

      const hfPrompt = `<|system|>\nYou are SentinelBuddy, an expert marine biologist monitoring water quality.\n<|user|>\n${prompt}\n<|assistant|>\n`;

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          inputs: hfPrompt,
          parameters: {
            max_new_tokens: max_tokens || 100,
            temperature: 0.7,
            return_full_text: false
          }
        },
        { headers: headers }
      );

      // HF sometimes returns an array of objects
      let textOut = 'Fallback API error parsing response.';
      if (Array.isArray(response.data) && response.data[0].generated_text) {
        textOut = response.data[0].generated_text;
      } else if (response.data.generated_text) {
        textOut = response.data.generated_text;
      }

      res.json({ success: true, text: textOut });

    } catch (error) {
      console.error('Fallback LLM Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to generate fallback response' });
    }
  });
});