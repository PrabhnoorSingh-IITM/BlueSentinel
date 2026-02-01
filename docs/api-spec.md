# API Specification

BlueSentinel doesn't have a traditional REST API yet, but here's how data flows through Firebase.

## Firebase Realtime Database

### Current Endpoints

#### Read Latest Sensor Data
```javascript
db.ref('BlueSentinel').on('value', (snapshot) => {
  const data = snapshot.val();
  // { temperature: 25.4, pH: 7.2 }
});
```

#### Write Sensor Data (ESP32)
```cpp
Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/temperature", temperatureC);
Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/pH", pH);
```

### Planned API Structure

#### GET /sensors/latest
Get most recent sensor readings

**Response:**
```json
{
  "temperature": 25.4,
  "pH": 7.2,
  "turbidity": 5.1,
  "dissolvedOxygen": 8.3,
  "salinity": 35.2,
  "timestamp": 1738454400000
}
```

#### GET /sensors/history?limit=100
Get historical data

**Query Parameters:**
- `limit`: Number of records (default: 30, max: 1000)
- `startDate`: Unix timestamp
- `endDate`: Unix timestamp

**Response:**
```json
[
  {
    "temperature": 25.0,
    "pH": 7.1,
    "timestamp": 1738454300000
  },
  {
    "temperature": 25.2,
    "pH": 7.2,
    "timestamp": 1738454350000
  }
]
```

#### POST /sensors/data
Upload new sensor reading (ESP32)

**Request Body:**
```json
{
  "deviceId": "ESP32-001",
  "temperature": 25.4,
  "pH": 7.2,
  "turbidity": 5.1,
  "timestamp": 1738454400000
}
```

**Response:**
```json
{
  "success": true,
  "id": "-N1234567890"
}
```

#### GET /health-score
Calculate marine health score

**Response:**
```json
{
  "score": 87,
  "status": "good",
  "factors": {
    "temperature": { "value": 25.4, "score": 95 },
    "pH": { "value": 7.2, "score": 85 },
    "turbidity": { "value": 5.1, "score": 80 }
  }
}
```

## Future Cloud Functions

### Anomaly Detection
```javascript
exports.detectAnomaly = functions.database
  .ref('/sensors/latest')
  .onWrite((change, context) => {
    const data = change.after.val();
    
    // Check thresholds
    if (data.pH < 6.5 || data.pH > 8.5) {
      // Send alert
      sendSMS('pH anomaly detected!');
    }
    
    if (data.temperature > 35) {
      // Send alert
      sendSMS('High temperature alert!');
    }
  });
```

### SMS Alerts (Twilio)
```javascript
exports.sendAlert = functions.https.onCall((data, context) => {
  const client = twilio(accountSid, authToken);
  
  return client.messages.create({
    body: data.message,
    from: '+1234567890',
    to: data.phoneNumber
  });
});
```

## Data Models

### SensorReading
```typescript
interface SensorReading {
  temperature: number;      // Celsius
  pH: number;              // 0-14 scale
  turbidity: number;       // NTU
  dissolvedOxygen: number; // mg/L
  salinity: number;        // PSU
  timestamp: number;       // Unix milliseconds
  deviceId?: string;       // Optional device ID
}
```

### HealthScore
```typescript
interface HealthScore {
  score: number;           // 0-100
  status: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  factors: {
    [key: string]: {
      value: number;
      score: number;
    }
  };
  calculatedAt: number;
}
```

## Rate Limits

Firebase Free Tier:
- 100 simultaneous connections
- 10 GB/month storage
- 50,000 reads/day
- 20,000 writes/day

ESP32:
- Uploads every 5 seconds
- ~17,280 writes/day (within limit)

## Authentication

Not implemented yet. Planned:

```javascript
// Login
firebase.auth().signInWithEmailAndPassword(email, password);

// Get ID token
const token = await firebase.auth().currentUser.getIdToken();

// API call with auth
fetch('/api/sensors', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Codes

### Firebase Errors
- `PERMISSION_DENIED`: Database rules rejected access
- `NETWORK_ERROR`: No internet connection
- `WRITE_FAILED`: Failed to write data

### Custom Errors (Planned)
- `INVALID_READING`: Sensor value out of range
- `DEVICE_OFFLINE`: ESP32 not responding
- `THRESHOLD_BREACH`: Value exceeds safe limits

## WebSocket (Real-time)

Firebase handles WebSocket connections automatically:
```javascript
// Auto-reconnects on disconnect
db.ref('BlueSentinel').on('value', callback);

// Disconnect
db.ref('BlueSentinel').off('value', callback);
```

## Export API (Future)

```javascript
exports.exportData = functions.https.onRequest((req, res) => {
  // Generate CSV
  const csv = generateCSV(sensorData);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
  res.send(csv);
});
```