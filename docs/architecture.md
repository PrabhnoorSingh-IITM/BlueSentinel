# System Architecture

BlueSentinel is a full-stack IoT system for ocean monitoring. Here's how everything connects.

## Tech Stack

### Hardware
- **ESP32 Dev Module**: Main microcontroller (WiFi enabled)
- **DS18B20**: Waterproof temperature sensor
- **pH Sensor Kit**: Analog pH sensor with probe
- Power supply (5V USB or battery pack for deployment)

### Backend
- **Firebase Realtime Database**: Real-time data storage
- **Firebase Cloud Functions**: Serverless processing (planned)
- **Firebase Authentication**: User login (planned)

### Frontend
- **HTML/CSS/JavaScript**: Dashboard UI
- **Chart.js**: Live graphs
- **Firebase SDK v9**: Real-time data listeners

### ML (Future)
- **Python**: Data analysis and model training
- **TensorFlow/PyTorch**: ML models
- **Jupyter Notebooks**: Experimentation

## Data Flow

```
ESP32 Sensors
    ↓
[Read Temperature & pH]
    ↓
Firebase Realtime DB
    |
    ├→ /BlueSentinel/temperature
    └→ /BlueSentinel/pH
    ↓
Dashboard (Live Listeners)
    ↓
[Update Cards & Graph]
```

## Firebase Structure

Current:
```json
{
  "BlueSentinel": {
    "temperature": 25.4,
    "pH": 7.2
  }
}
```

Planned (with history):
```json
{
  "sensors": {
    "latest": {
      "temperature": 25.4,
      "pH": 7.2,
      "turbidity": 5.1,
      "timestamp": 1738454400000
    },
    "history": {
      "2025-02-01": [
        { "temp": 25.0, "pH": 7.1, "time": "10:00" },
        { "temp": 25.2, "pH": 7.2, "time": "10:05" }
      ]
    }
  }
}
```

## Frontend Architecture

### Dashboard Components

1. **Sensor Cards** (`dashboard.html`)
   - 5 glass-morphism cards
   - Display current readings
   - Update in real-time

2. **Live Graph** (`dashboard.js`)
   - Chart.js multi-line chart
   - 30-point rolling window
   - Multiple y-axes for different units

3. **Navigation** (`global.css`)
   - Glass-effect bottom nav
   - Links to dashboard, logs, profile

### JavaScript Architecture

```javascript
// Firebase initialization
firebase.initializeApp(config)
db = firebase.database()

// Real-time listener
db.ref('BlueSentinel').on('value', (snapshot) => {
  // Update cards
  // Add simulated data
  // Update graph
})
```

## Security

### Firebase Rules
Currently open for development:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Production rules (not implemented yet):
```json
{
  "rules": {
    "sensors": {
      ".read": "auth != null",
      ".write": "auth.uid === 'esp32-device'"
    }
  }
}
```

### Credentials
- WiFi credentials in `secrets.h` (gitignored)
- Firebase API keys in frontend (public, read-only)
- Never commit `secrets.h` to Git

## Deployment

### Hardware Deployment
1. Upload firmware to ESP32
2. Put sensors in waterproof enclosure
3. Deploy at monitoring site
4. Power via solar panel + battery

### Frontend Deployment
1. Host on Firebase Hosting
2. `firebase deploy`
3. Access at custom domain

## Scalability

Current: Single ESP32, single location

Future:
- Multiple devices with unique IDs
- Geographic distribution
- Load balancing with Firebase
- Data aggregation at regional level

## Performance

- **Data Upload**: Every 5 seconds from ESP32
- **Dashboard Update**: Real-time (< 100ms latency)
- **Graph Rendering**: 30 points max (no lag)
- **Firebase Costs**: Free tier (50k reads/day)