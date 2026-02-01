# Dashboard Backend Integration Guide

## Overview

The BlueSentinel dashboard uses Firebase Realtime Database with real-time listeners to display live sensor data and graphs. The ESP32 sends data, and the web dashboard automatically updates.

---

## Architecture

```
┌──────────────────┐
│   ESP32 Sensors  │
│   (Hardware)     │
└────────┬─────────┘
         │
         │ WiFi
         ↓
┌──────────────────────────────┐
│  Firebase Realtime Database  │
│  sensors/latest              │
│  sensors/history             │
└────────┬─────────────────────┘
         │
         │ Real-time listeners
         ↓
┌──────────────────────────────┐
│  Web Dashboard               │
│  (public/js/dashboard.js)    │
│  • Live sensor cards         │
│  • Chart.js graphs           │
└──────────────────────────────┘
```

---

## File Locations

| File | Purpose |
|------|---------|
| `public/dashboard.html` | Dashboard page HTML |
| `public/js/dashboard.js` | **Backend logic - Real-time listeners & graphs** |
| `public/css/dashboard.css` | Dashboard styling |
| `public/js/core/firebase-init.js` | Firebase initialization |

---

## Dashboard Backend Code (`public/js/dashboard.js`)

### Key Components

#### 1. **Chart Initialization**
```javascript
function initializeChart()
```
- Sets up Chart.js with 4 datasets
- Configures multiple Y-axes for different value ranges
- Sets styling, colors, and tooltips

#### 2. **Firebase Listeners**
```javascript
function initializeDashboard()
```
- Connects to `sensors/latest` for real-time card updates
- Connects to `sensors/history` for graph historical data
- Establishes real-time event listeners

#### 3. **Data Update Functions**
- `handleLatestData()` - Updates cards when new data arrives
- `handleHistoryData()` - Adds historical points to graph
- `updateSensorCards()` - Updates individual sensor card values
- `addDataPointToChart()` - Adds point to live graph

---

## How It Works: Real-Time Flow

### Step 1: ESP32 Sends Data
```json
{
  "sensors": {
    "latest": {
      "temperature": 25.5,
      "ph": 7.2,
      "turbidity": 5.3,
      "dissolvedOxygen": 8.5,
      "timestamp": 1738454400000
    }
  }
}
```

### Step 2: Firebase Listener Fires
```javascript
sensorLatestRef.on('value', handleLatestData);
```

### Step 3: Dashboard Updates
- **Cards:** Temperature, pH, Turbidity, DO values update instantly
- **Graph:** New point added to Chart.js if valid timestamp

### Step 4: User Sees Live Data
- All updates happen in real-time (< 1 second delay)
- Graph shows last 30 data points
- Cards show current values

---

## Configuration

### Firebase Database Rules
Your `database.rules.json` should allow reads/writes:
```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true,
      "latest": {
        ".indexOn": ["timestamp"]
      },
      "history": {
        ".indexOn": ["timestamp"]
      }
    }
  }
}
```

Deploy with:
```bash
firebase deploy --only database
```

### Firebase Init
Edit `public/js/core/firebase-init.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Data Limits & Performance

| Setting | Value | Reason |
|---------|-------|--------|
| Max Chart Points | 30 | Smooth scrolling, manageable memory |
| Update Interval | 5-10 seconds | Real-time feel, Firebase quota |
| History Load | 30 records | Initial graph population |
| Time Format | 12:34:56 AM | User-friendly |

---

## Testing the Backend

### Option 1: Use Simulated Data (Browser Console)
```javascript
// Open DevTools (F12) → Console
const db = firebase.database();

setInterval(() => {
  const data = {
    temperature: (20 + Math.random() * 10).toFixed(1),
    ph: (6.5 + Math.random() * 2).toFixed(2),
    turbidity: (1 + Math.random() * 10).toFixed(1),
    dissolvedOxygen: (6 + Math.random() * 4).toFixed(2),
    timestamp: Date.now()
  };
  db.ref('sensors/latest').set(data);
  db.ref('sensors/history').push(data);
}, 5000);
```

### Option 2: Use Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Realtime Database
3. Manually add data to `sensors/latest`
4. Watch dashboard update in real-time

### Option 3: Use Real ESP32
1. Flash ESP32 with firmware
2. ESP32 starts sending sensor data
3. Watch dashboard populate

---

## Debugging

### View Console Logs
Open browser DevTools (F12) → Console tab

Expected logs:
```
Firebase database initialized
Chart initialized successfully
Firebase listeners initialized
Latest data received: {temperature: 25.5, ...}
Cards updated at: 12:34:56 PM
Graph point added: 12:34:56 PM
```

### Check Firebase Connectivity
```javascript
// In console
firebase.database().ref('.info/connected').on('value', (snapshot) => {
  console.log('Connected:', snapshot.val());
});
```

### Monitor Real-Time Listeners
```javascript
// In console
db.ref('sensors/latest').on('value', (snap) => {
  console.log('Latest:', snap.val());
});
```

---

## Customization

### Change Update Interval
Edit `public/js/dashboard.js`:
```javascript
const uploadIntervalMs = 10000; // 10 seconds
```

### Change Chart Data Points
```javascript
const maxDataPoints = 50; // Show last 50 points instead of 30
```

### Change Graph Colors
```javascript
{
  label: 'Temperature (°C)',
  borderColor: 'rgb(239, 68, 68)',  // Change this color
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  ...
}
```

### Add More Sensors
1. Add new field to Firebase (e.g., `salinity`)
2. Add new card HTML element
3. Add new dataset to chart
4. Add update function in JavaScript

---

## Performance Considerations

- **Listeners:** Trigger on every change → can use bandwidth
- **Data Points:** 30 points = smooth but manageable
- **Update Frequency:** 5 seconds = good balance
- **Historical Load:** limitToLast(30) = efficient query

For production optimization:
- Use Firebase indexing on `timestamp`
- Archive old data monthly
- Implement data aggregation for daily/hourly averages
- Add pagination for historical data

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No sensor data available" | ESP32 not sending data to Firebase |
| Chart not appearing | Check canvas element ID matches |
| Cards show "--" | Firebase not returning data |
| Graph not updating | Check listener event handlers |
| Very slow updates | Check Firebase rules & network |

---

## Next Steps

1. ✅ Backend code ready in `dashboard.js`
2. ✅ Firebase integration configured
3. ⏳ Flash ESP32 with firmware
4. ⏳ Add Firebase credentials to ESP32
5. ⏳ Test with real sensor data
6. 📊 Monitor dashboard for live updates

---

## API Reference

### Main Functions
```javascript
initializeChart()           // Setup Chart.js
initializeDashboard()       // Setup Firebase listeners
handleLatestData(snapshot)  // Process new sensor reading
updateSensorCards(data)     // Update card values
addDataPointToChart(data)   // Add point to graph
getLiveDataSummary()        // Get current values
exportChartData()           // Export data points
```

### Firebase Paths
```
sensors/latest             // Current reading (overwrite)
sensors/history           // All readings (append-only)
```

### Data Fields
```
temperature               // °C
ph                       // pH scale (0-14)
turbidity                // NTU
dissolvedOxygen          // mg/L
timestamp                // Unix milliseconds
deviceId                 // "ESP32-001"
```

---

## Support

For issues:
1. Check browser console (F12)
2. Verify Firebase credentials
3. Test with simulated data
4. Check ESP32 serial output
5. Review Firebase rules
