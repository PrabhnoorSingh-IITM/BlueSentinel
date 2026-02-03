# API Specification

BlueSentinel uses **Firebase Realtime Database** as its primary data store, with real-time WebSocket connections for live sensor monitoring. Currently, 2 APIs are actively used in production.

## 🚀 Current APIs in Use

### 1. Firebase Realtime Database
**Purpose**: Core sensor data storage and real-time synchronization

#### **Current Database Structure**
```json
{
  "BlueSentinel": {
    "temperature": 20.5,
    "pH": 6.9709,
    "turbidity": 0.53,
    "timestamp": 1738454400000
  }
}
```

#### **Read Latest Sensor Data (Dashboard)**
```javascript
// Real-time listener for live updates
db.ref('BlueSentinel').on('value', (snapshot) => {
  const data = snapshot.val();
  console.log('Latest sensor data:', data);
  // Updates dashboard cards and graphs in real-time
});
```

#### **Write Sensor Data (ESP32)**
```cpp
// ESP32 uploads every 5 seconds
Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/temperature", temperatureC);
Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/pH", pH);
Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/turbidity", turbidity);
```

### 2. NewsAPI.org
**Purpose**: Marine conservation news aggregation

#### **Endpoint**: `https://newsapi.org/v2/everything`

#### **Query Parameters**
```javascript
const params = {
  q: 'ocean conservation OR marine pollution OR coral reef',
  language: 'en',
  sortBy: 'publishedAt',
  pageSize: 10,
  apiKey: process.env.NEWS_API_KEY
};
```

#### **Response Format**
```json
{
  "status": "ok",
  "totalResults": 842,
  "articles": [
    {
      "title": "New Coral Reef Discovery in Pacific",
      "description": "Scientists discover...",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2026-01-15T10:30:00Z",
      "source": { "name": "National Geographic" }
    }
  ]
}
```

## 📊 Data Models

### **SensorReading (Current)**
```typescript
interface SensorReading {
  temperature: number;    // Celsius (Real sensor: DS18B20)
  pH: number;            // pH scale (Real sensor: pH probe)
  turbidity: number;     // NTU (Real sensor: Turbidity sensor)
  timestamp?: number;    // Unix milliseconds (auto-generated)
}
```

### **SensorReading (Extended - Frontend)**
```typescript
interface ExtendedSensorReading extends SensorReading {
  dissolvedOxygen: number; // mg/L (Simulated)
  salinity: number;       // PSU (Simulated)
}
```

### **NewsArticle**
```typescript
interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;    // ISO 8601 format
  source: {
    name: string;
  };
}
```

## 🔄 Data Flow Architecture

```
ESP32 Sensors → Firebase Realtime DB → Dashboard
     │                │                      │
     │                │                      ├─ Live Cards Update
     │                │                      ├─ Chart.js Graph
     │                │                      └─ News Cards (NewsAPI)
     │                └─ /BlueSentinel/ (Node)
     ├─ temperature: 20.5
     ├─ pH: 6.9709
     └─ turbidity: 0.53
```

## 📡 Real-time Communication

### **Firebase WebSocket Connection**
```javascript
// Automatic reconnection handled by Firebase SDK
const unsubscribe = db.ref('BlueSentinel').on('value', (snapshot) => {
  const data = snapshot.val();
  updateDashboard(data);
}, (error) => {
  console.error('Firebase error:', error);
  // Auto-reconnect on network issues
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  unsubscribe();
});
```

### **Update Frequency**
- **ESP32 Uploads**: Every 5 seconds
- **Dashboard Updates**: Instant (real-time)
- **News Refresh**: Every 30 minutes
- **Chart Window**: Last 30 data points

## 🔐 Authentication & Security

### **Current Implementation**
- **ESP32 Authentication**: Firebase service account authentication
- **Database Rules**: Development mode (open for read/write)
- **API Keys**: Environment variables

### **Firebase Rules (Current)**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### **Production Rules (Recommended)**
```json
{
  "rules": {
    "BlueSentinel": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.admin === true"
    }
  }
}
```

## 📈 Rate Limits & Quotas

### **Firebase Free Tier**
- **Storage**: 1 GB total
- **Database**: 1 GB stored, 10 GB/month downloaded
- **Simultaneous Connections**: 100
- **Document Reads**: 50,000/day
- **Document Writes**: 20,000/day

### **Current Usage**
- **ESP32 Writes**: ~17,280/day (every 5 seconds)
- **Dashboard Reads**: Continuous (WebSocket)
- **News API**: 48 requests/day (every 30 minutes)

### **NewsAPI Limits**
- **Free Tier**: 1,000 requests/day
- **Current Usage**: 48 requests/day (4.8% of limit)

## 🚧 Planned APIs (Not Implemented)

### **Firebase Cloud Functions**

#### **Health Score Calculation**
```javascript
// GET /api/healthScore
exports.calculateHealthScore = functions.https.onRequest(async (req, res) => {
  const snapshot = await db.ref('BlueSentinel').once('value');
  const data = snapshot.val();
  
  const score = calculateMarineHealthScore(data);
  
  res.json({
    score: score.total,
    status: score.status,
    factors: score.factors,
    timestamp: Date.now()
  });
});
```

#### **Anomaly Detection & Alerts**
```javascript
// Trigger on sensor data changes
exports.detectAnomaly = functions.database
  .ref('/BlueSentinel')
  .onWrite(async (change, context) => {
    const data = change.after.val();
    const previous = change.before.val();
    
    // Check for threshold breaches
    const anomalies = detectAnomalies(data, previous);
    
    if (anomalies.length > 0) {
      await sendAlerts(anomalies);
    }
  });
```

#### **Historical Data Export**
```javascript
// GET /api/export?format=csv&days=30
exports.exportData = functions.https.onRequest(async (req, res) => {
  const { format = 'csv', days = 30 } = req.query;
  
  const data = await getHistoricalData(days);
  
  if (format === 'csv') {
    const csv = generateCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bluesentinel-data.csv"');
    res.send(csv);
  } else {
    res.json(data);
  }
});
```

### **Multi-Device Support**
```javascript
// Structure for multiple ESP32 devices
{
  "BlueSentinel": {
    "devices": {
      "ESP32-001": {
        "temperature": 20.5,
        "pH": 6.9709,
        "turbidity": 0.53,
        "location": {
          "lat": 19.0760,
          "lng": 72.8777
        },
        "lastSeen": 1738454400000
      },
      "ESP32-002": { /* ... */ }
    },
    "latest": {
      "temperature": 20.5,
      "pH": 6.9709,
      "turbidity": 0.53
    }
  }
}
```

## 🛠️ Development & Testing

### **Local Development**
```bash
# Start Firebase emulator
firebase emulators:start --only database

# Test endpoints locally
curl http://localhost:5000/api/healthScore
```

### **Mock Data Generation**
```javascript
// For development without hardware
function generateMockSensorData() {
  return {
    temperature: 20 + Math.random() * 10,
    pH: 6.5 + Math.random() * 2,
    turbidity: Math.random() * 10,
    timestamp: Date.now()
  };
}
```

## 🔍 Monitoring & Debugging

### **Firebase Console**
- **Real-time Database**: View live data
- **Usage Analytics**: Monitor quotas
- **Error Reporting**: Track issues

### **Debugging Tools**
```javascript
// Firebase debug mode
firebase.database.enableLogging(true);

// Network monitoring
db.ref('BlueSentinel').on('value', (snapshot) => {
  console.log('Data received:', snapshot.val());
  console.log('Timestamp:', new Date().toISOString());
});
```

## 📱 Client-Side Integration

### **JavaScript SDK Setup**
```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
```

### **Error Handling**
```javascript
db.ref('BlueSentinel').on('value', (snapshot) => {
  // Success callback
}, (error) => {
  console.error('Firebase error:', error);
  
  switch(error.code) {
    case 'PERMISSION_DENIED':
      showUserError('Access denied. Please check authentication.');
      break;
    case 'NETWORK_ERROR':
      showUserError('Network connection lost. Retrying...');
      break;
    default:
      showUserError('An error occurred. Please refresh.');
  }
});
```

---

## 📞 API Support

### **Current Status**
- ✅ **Firebase Realtime Database**: Fully operational
- ✅ **NewsAPI.org**: Integrated and working
- 🔄 **Cloud Functions**: Planned for next phase

### **Get Help**
- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/PrabhnoorSingh-IITM/BlueSentinel/issues)
- **Firebase Console**: [Firebase Dashboard](https://console.firebase.google.com)

---

*Last Updated: February 2026 | Version: 1.0 | Status: Production Ready*