# API Specification

## Overview

BlueSentinel's API layer consists of two main components:
1. **Firebase Realtime Database API**: Direct client access to sensor data and logs
2. **Cloud Functions API** (Planned): RESTful endpoints for advanced functionality

This document specifies data structures, authentication requirements, security rules, and usage patterns for interacting with the BlueSentinel backend.

---

## Firebase Realtime Database API

### Base URL
```
https://bluesentinel-6d265-default-rtdb.firebaseio.com/
```

### Authentication

All database operations require authentication via Firebase Authentication.

**Web Client Authentication**:
```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
// Authenticated user can now access database
```

**ESP32 Device Authentication**:
```cpp
#include <Firebase_ESP_Client.h>

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

auth.user.email = FIREBASE_USER;
auth.user.password = FIREBASE_PASSWORD;
config.api_key = API_KEY;
config.database_url = DATABASE_URL;

Firebase.begin(&config, &auth);
```

---

## Data Structures

### Sensor Data Node

**Path**: `/BlueSentinel`

**Structure**:
```json
{
  "temperature": 24.5,
  "pH": 7.8,
  "turbidity": 2.3,
  "dissolvedOxygen": 8.2,
  "salinity": 35.0,
  "timestamp": 1738454400000
}
```

**Field Specifications**:

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `temperature` | Float | °C | -10 to 50 | Water temperature in Celsius |
| `pH` | Float | pH units | 0 to 14 | Acidity/alkalinity level |
| `turbidity` | Float | NTU | 0 to 1000 | Water clarity (Nephelometric Turbidity Units) |
| `dissolvedOxygen` | Float | mg/L | 0 to 20 | Dissolved oxygen concentration |
| `salinity` | Float | ppt | 0 to 50 | Salt concentration (parts per thousand) |
| `timestamp` | Integer | milliseconds | Unix epoch | Time of measurement |

**Update Frequency**: Every 5 seconds

**Retention Policy**: Single-node overwrite (only latest value stored)

---

### Incident Logs Node

**Path**: `/incidents`

**Structure**:
```json
{
  "incidents": {
    "-NgE3xYZ123abc": {
      "type": "alert",
      "parameter": "pH",
      "value": 5.2,
      "threshold": 6.0,
      "severity": "critical",
      "location": "Sensor Unit 01",
      "timestamp": 1738454400000,
      "status": "investigating",
      "assignedTo": null,
      "resolvedAt": null,
      "notes": "Sudden pH drop detected"
    },
    "-NgE3xYZ456def": {
      "type": "warning",
      "parameter": "temperature",
      "value": 33.5,
      "threshold": 32.0,
      "severity": "warning",
      "location": "Sensor Unit 01",
      "timestamp": 1738454460000,
      "status": "acknowledged",
      "assignedTo": "user@example.com",
      "resolvedAt": null,
      "notes": null
    }
  }
}
```

**Field Specifications**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | String | Yes | Incident type: "alert" or "warning" |
| `parameter` | String | Yes | Which sensor triggered: "temperature", "pH", "turbidity", "dissolvedOxygen", "salinity" |
| `value` | Float | Yes | Measurement value that breached threshold |
| `threshold` | Float | Yes | The threshold value that was exceeded |
| `severity` | String | Yes | "critical" or "warning" |
| `location` | String | Yes | Human-readable sensor location |
| `timestamp` | Integer | Yes | Unix timestamp in milliseconds |
| `status` | String | Yes | "new", "acknowledged", "investigating", "resolved" |
| `assignedTo` | String | No | Email of assigned responder |
| `resolvedAt` | Integer | No | Unix timestamp when resolved |
| `notes` | String | No | Additional context or resolution notes |

**Indexing**: Incidents are stored with Firebase push IDs for automatic chronological ordering.

---

## Database Operations

### Read Operations

#### Get Current Sensor Data

**JavaScript (Web)**:
```javascript
import { getDatabase, ref, get } from 'firebase/database';

const db = getDatabase();
const snapshot = await get(ref(db, 'BlueSentinel'));
const sensorData = snapshot.val();

console.log('Temperature:', sensorData.temperature);
console.log('pH:', sensorData.pH);
```

**Expected Response**:
```json
{
  "temperature": 24.5,
  "pH": 7.8,
  "turbidity": 2.3,
  "dissolvedOxygen": 8.2,
  "salinity": 35.0,
  "timestamp": 1738454400000
}
```

#### Listen to Real-Time Updates

**JavaScript (Web)**:
```javascript
import { getDatabase, ref, onValue } from 'firebase/database';

const db = getDatabase();
const sensorRef = ref(db, 'BlueSentinel');

onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  updateDashboard(data);
}, (error) => {
  console.error('Database read error:', error);
});
```

**Benefits**:
- Automatic updates when data changes
- No polling required
- Sub-100ms latency

#### Query Incident Logs

**JavaScript (Web)**:
```javascript
import { getDatabase, ref, query, orderByChild, limitToLast } from 'firebase/database';

const db = getDatabase();
const incidentsRef = ref(db, 'incidents');

// Get most recent 20 incidents
const recentIncidents = query(
  incidentsRef,
  orderByChild('timestamp'),
  limitToLast(20)
);

onValue(recentIncidents, (snapshot) => {
  const logs = [];
  snapshot.forEach((child) => {
    logs.push({ id: child.key, ...child.val() });
  });
  displayLogs(logs.reverse());
});
```

**Query Operators**:
- `orderByChild(field)`: Sort by specific field
- `limitToFirst(n)`: Limit results to first n items
- `limitToLast(n)`: Limit results to last n items
- `startAt(value)`: Start at specific value
- `endAt(value)`: End at specific value
- `equalTo(value)`: Filter by exact match

---

### Write Operations

#### Update Sensor Data (ESP32)

**C++ (Arduino)**:
```cpp
#include <Firebase_ESP_Client.h>

FirebaseData fbdo;
FirebaseJson json;

// Prepare sensor readings
json.set("temperature", temperature);
json.set("pH", pH);
json.set("turbidity", turbidity);
json.set("dissolvedOxygen", dissolvedOxygen);
json.set("salinity", salinity);
json.set("timestamp", millis());

// Write to database
if (Firebase.RTDB.setJSON(&fbdo, "/BlueSentinel", &json)) {
  Serial.println("Data uploaded successfully");
} else {
  Serial.println("Upload failed: " + fbdo.errorReason());
}
```

**Rate Limiting**: Maximum 1 write per second per device (enforced by security rules)

#### Create Incident Log

**JavaScript (Web)**:
```javascript
import { getDatabase, ref, push } from 'firebase/database';

const db = getDatabase();
const incidentsRef = ref(db, 'incidents');

const newIncident = {
  type: 'alert',
  parameter: 'pH',
  value: 5.2,
  threshold: 6.0,
  severity: 'critical',
  location: 'Sensor Unit 01',
  timestamp: Date.now(),
  status: 'new',
  assignedTo: null,
  resolvedAt: null,
  notes: 'Sudden pH drop detected'
};

await push(incidentsRef, newIncident);
```

**Validation**: Firebase Security Rules enforce required fields and data types.

#### Update Incident Status

**JavaScript (Web)**:
```javascript
import { getDatabase, ref, update } from 'firebase/database';

const db = getDatabase();
const incidentRef = ref(db, `incidents/${incidentId}`);

await update(incidentRef, {
  status: 'investigating',
  assignedTo: 'user@example.com'
});
```

---

## Security Rules

### Current Security Configuration

**File**: `database.rules.json`

```json
{
  "rules": {
    "BlueSentinel": {
      ".read": "auth != null",
      ".write": "auth != null && 
                 newData.hasChildren(['temperature', 'pH', 'turbidity', 'dissolvedOxygen', 'salinity', 'timestamp']) &&
                 newData.child('temperature').isNumber() &&
                 newData.child('pH').isNumber() &&
                 newData.child('turbidity').isNumber() &&
                 newData.child('dissolvedOxygen').isNumber() &&
                 newData.child('salinity').isNumber() &&
                 newData.child('timestamp').isNumber()"
    },
    "incidents": {
      ".read": "auth != null",
      "$incidentId": {
        ".write": "auth != null && 
                   (newData.child('type').val() == 'alert' || newData.child('type').val() == 'warning') &&
                   newData.hasChildren(['type', 'parameter', 'value', 'timestamp', 'status'])"
      }
    }
  }
}
```

### Rule Explanations

**Authentication Requirements**:
- All read operations require authenticated user
- All write operations require authenticated user

**Data Validation**:
- Sensor data must include all 6 required fields
- All sensor values must be numbers
- Incident type must be "alert" or "warning"
- Incidents must include required fields: type, parameter, value, timestamp, status

**Rate Limiting** (Planned):
```json
{
  "BlueSentinel": {
    ".write": "auth != null && 
               !data.exists() || 
               (data.child('timestamp').val() + 5000 < now)"
  }
}
```
This rule enforces minimum 5-second interval between updates.

---

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `PERMISSION_DENIED` | User not authenticated or lacks permissions | Ensure user is signed in and has proper role |
| `NETWORK_ERROR` | Network connection lost | Implement retry logic with exponential backoff |
| `INVALID_DATA` | Data validation failed | Check data structure matches schema |
| `DISCONNECTED` | Client disconnected from database | Firebase automatically reconnects |
| `MAX_RETRIES` | Exceeded retry limit | Check network connectivity and Firebase status |

### Error Handling Pattern

**JavaScript**:
```javascript
import { getDatabase, ref, set } from 'firebase/database';

async function writeSensorData(data) {
  const db = getDatabase();
  const sensorRef = ref(db, 'BlueSentinel');
  
  try {
    await set(sensorRef, data);
    console.log('Write successful');
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Authentication required');
      // Redirect to login
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error, retrying...');
      // Implement retry logic
      setTimeout(() => writeSensorData(data), 5000);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

**Arduino (ESP32)**:
```cpp
bool uploadWithRetry(FirebaseData &fbdo, const String &path, FirebaseJson &json, int maxRetries = 3) {
  int attempts = 0;
  while (attempts < maxRetries) {
    if (Firebase.RTDB.setJSON(&fbdo, path, &json)) {
      return true;
    }
    Serial.println("Upload failed: " + fbdo.errorReason());
    attempts++;
    delay(5000 * attempts); // Exponential backoff
  }
  return false;
}
```

---

## Cloud Functions API (Planned)

### Base URL
```
https://us-central1-bluesentinel-6d265.cloudfunctions.net/
```

### Endpoints

#### GET /api/healthScore

Calculate composite water quality score.

**Request**:
```http
GET /api/healthScore
Authorization: Bearer {firebase_id_token}
```

**Response**:
```json
{
  "score": 85,
  "rating": "Good",
  "factors": {
    "temperature": { "value": 24.5, "score": 90, "weight": 0.2 },
    "pH": { "value": 7.8, "score": 95, "weight": 0.3 },
    "turbidity": { "value": 2.3, "score": 80, "weight": 0.2 },
    "dissolvedOxygen": { "value": 8.2, "score": 85, "weight": 0.2 },
    "salinity": { "value": 35.0, "score": 75, "weight": 0.1 }
  },
  "timestamp": 1738454400000
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Calculation failed

---

#### POST /api/predictions

Get water quality predictions for next 24 hours.

**Request**:
```http
POST /api/predictions
Authorization: Bearer {firebase_id_token}
Content-Type: application/json

{
  "parameters": ["temperature", "pH"],
  "horizon": 24
}
```

**Response**:
```json
{
  "predictions": {
    "temperature": [
      { "timestamp": 1738458000000, "value": 24.8, "confidence": 0.92 },
      { "timestamp": 1738461600000, "value": 25.1, "confidence": 0.89 },
      { "timestamp": 1738465200000, "value": 25.3, "confidence": 0.85 }
    ],
    "pH": [
      { "timestamp": 1738458000000, "value": 7.7, "confidence": 0.88 },
      { "timestamp": 1738461600000, "value": 7.6, "confidence": 0.84 },
      { "timestamp": 1738465200000, "value": 7.5, "confidence": 0.80 }
    ]
  },
  "model": "LSTM-v1.2",
  "generatedAt": 1738454400000
}
```

**Parameters**:
- `parameters`: Array of sensor names to predict
- `horizon`: Prediction window in hours (1-72)

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Invalid or missing token
- `503 Service Unavailable`: ML model not available

---

#### POST /api/chatbot

Natural language query interface.

**Request**:
```http
POST /api/chatbot
Authorization: Bearer {firebase_id_token}
Content-Type: application/json

{
  "query": "What was the pH level 2 hours ago?",
  "context": "dashboard"
}
```

**Response**:
```json
{
  "answer": "Two hours ago, the pH level was 7.9, which is within the normal range for ocean water.",
  "data": {
    "pH": 7.9,
    "timestamp": 1738447200000
  },
  "confidence": 0.95
}
```

**Supported Query Types**:
- Historical data lookup: "What was the temperature yesterday?"
- Threshold checks: "Is the pH level safe?"
- Trend analysis: "How has turbidity changed this week?"
- Incident summaries: "Show me recent alerts"

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Query could not be parsed
- `401 Unauthorized`: Invalid or missing token
- `429 Too Many Requests`: Rate limit exceeded

---

## Rate Limits

### Database Operations

**Read Operations**:
- Concurrent connections: 200 per user
- Bandwidth: 10 GB/month (free tier)
- Queries: Unlimited

**Write Operations**:
- Frequency: 1 write per 5 seconds per path
- Bandwidth: 1 GB/month (free tier)
- Payload size: 256 MB per write

### Cloud Functions (Planned)

**API Endpoints**:
- Requests per minute: 60
- Requests per day: 10,000
- Concurrent executions: 100

**Exceeding Limits**:
- HTTP 429 response with `Retry-After` header
- Exponential backoff recommended

---

## Best Practices

### Minimize Bandwidth

**Use Queries Instead of Full Downloads**:
```javascript
// Bad: Downloads all incidents
const allIncidents = await get(ref(db, 'incidents'));

// Good: Query only recent incidents
const recentQuery = query(
  ref(db, 'incidents'),
  orderByChild('timestamp'),
  limitToLast(20)
);
```

### Optimize Real-Time Listeners

**Detach Listeners When Not Needed**:
```javascript
const unsubscribe = onValue(sensorRef, callback);

// Later, when component unmounts:
unsubscribe();
```

### Batch Writes

**Atomic Multi-Location Updates**:
```javascript
import { getDatabase, ref, update } from 'firebase/database';

const updates = {};
updates['/BlueSentinel/temperature'] = 25.0;
updates['/BlueSentinel/timestamp'] = Date.now();

await update(ref(db), updates);
```

### Handle Offline Scenarios

**Enable Persistence** (Web):
```javascript
import { getDatabase, enablePersistence } from 'firebase/database';

const db = getDatabase();
enablePersistence(db)
  .catch((err) => {
    console.error('Persistence failed:', err);
  });
```

**Automatic Queue Management** (Arduino):
Firebase ESP Client automatically queues writes when offline and syncs when reconnected.

---

## Testing

### Development Environment

**Firebase Emulator Suite**:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

**Connect to Emulators**:
```javascript
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const db = getDatabase();
if (location.hostname === 'localhost') {
  connectDatabaseEmulator(db, 'localhost', 9000);
}
```

### Sample Test Data

**Seed Database with Test Data**:
```javascript
// scripts/seedFirebase.js
const sampleData = {
  BlueSentinel: {
    temperature: 24.5,
    pH: 7.8,
    turbidity: 2.3,
    dissolvedOxygen: 8.2,
    salinity: 35.0,
    timestamp: Date.now()
  },
  incidents: {
    '-TestIncident001': {
      type: 'alert',
      parameter: 'pH',
      value: 5.2,
      threshold: 6.0,
      severity: 'critical',
      location: 'Test Sensor',
      timestamp: Date.now(),
      status: 'new'
    }
  }
};

await set(ref(db), sampleData);
```

---

## Support

### Resources

- **Firebase Documentation**: https://firebase.google.com/docs/database
- **GitHub Repository**: https://github.com/PrabhnoorSingh-IITM/BlueSentinel
- **Issue Tracker**: https://github.com/PrabhnoorSingh-IITM/BlueSentinel/issues

### Contact

For API-related questions or issues:
1. Check existing GitHub issues
2. Review Firebase console logs
3. Open new issue with detailed description and error logs

### Status Page

Firebase Service Status: https://status.firebase.google.com/

Monitor for platform-wide outages affecting API availability.

---

## Changelog

### Version 1.0.0 (Current)
- Initial Firebase Realtime Database integration
- Sensor data structure defined
- Incident logging system implemented
- Security rules configured

### Planned (Version 2.0.0)
- Cloud Functions API endpoints
- Health score calculation
- ML prediction service
- Chatbot natural language interface
- Webhook system for external integrations

---

This specification documents the current API surface and planned enhancements. As the platform evolves, this document will be updated to reflect new capabilities and endpoints.
