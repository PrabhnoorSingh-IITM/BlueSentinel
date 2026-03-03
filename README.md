# BlueSentinel - Ocean Intelligence Platform

<div align="center">
  <img src="public/assets/images/logo.png" alt="BlueSentinel Logo" width="120"/>
  <h3>A Digital Nervous System for the Ocean</h3>
  <p>Real-time marine monitoring, early pollution detection, and rapid response</p>
</div>

## Overview

BlueSentinel is a full-stack IoT ocean monitoring platform that combines real hardware sensors with cloud infrastructure to detect water quality issues before they become disasters. Currently deployed with Temperature and pH sensors on ESP32, with simulated data for turbidity, dissolved oxygen, and salinity.

**Status**: v1.1 - Live sensor data flowing from ESP32 to Firebase dashboard

## Key Features

- **Live Water Quality Monitoring**: Real-time tracking of 5 parameters (Temperature & pH from real sensors)
- **Real-time Dashboard**: Chart.js live graphs with 30-point rolling window
- **Glass Morphism UI**: Modern design with new color palette (#00FFD4, #5465FF, #D2DDFF, #050208)
- **Firebase Integration**: Real-time database with instant updates
- **ESP32 Hardware**: Waterproof sensors uploading every 5 seconds
- **Responsive Design**: Works on desktop and mobile
- **Incident Logging**: Track water quality events with timestamps
- **News Integration**: Marine conservation updates

## Technology Stack

### Hardware
- **ESP32 Dev Module**: WiFi-enabled microcontroller
- **DS18B20**: Waterproof temperature sensor (real)
- **pH Sensor**: Analog pH probe (real)
- **Power**: USB or battery pack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js v4.4.0 for live graphs
- Firebase SDK v9.22.0
- Glass morphism design system
- Color palette: #00FFD4, #5465FF, #D2DDFF, #050208

### Backend
- Firebase Realtime Database
- Firebase Hosting
- ESP32 firmware (Arduino/C++)
- Real-time WebSocket connections

### Future/Planned
- Firebase Cloud Functions for alerts
- ML models for predictions
- Twilio SMS integration
- Additional sensors (turbidity, DO, salinity)

## Quick Start

### View Live Dashboard

1. **Open the dashboard**:
   ```bash
   cd BlueSentinel
   firebase serve
   # or open public/dashboard.html directly
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   firebase login
   firebase deploy
   ```

### Hardware Setup (ESP32)

1. **Wire sensors**:
   - DS18B20 → Pin 4 (DATA)
   - pH Sensor → Pin 32 (Analog)
   - Power and ground connections

2. **Update credentials** in `hardware/esp32/BlueSentinel/src/BlueSentinel.ino`:
   ```cpp
   #define WIFI_SSID "Your_WiFi"
   #define WIFI_PASSWORD "Your_Password"
   #define API_KEY "Your_Firebase_API_Key"
   #define DATABASE_URL "https://your-project.firebaseio.com/"
   ```

3. **Upload firmware**:
   - Open Arduino IDE
   - Install libraries: Firebase_ESP_Client, OneWire, DallasTemperature
   - Select board: ESP32 Dev Module
   - Upload

4. **Watch Serial Monitor** to see data uploading

5. **Check Firebase Console** to verify data in `/BlueSentinel/temperature` and `/BlueSentinel/pH`

## Project Structure

```
BlueSentinel/
├── public/                 # Frontend assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── assets/            # Images and icons
│   └── *.html             # HTML pages
├── functions/             # Firebase Cloud Functions
│   ├── api/               # API endpoints
│   ├── services/          # Business logic
│   └── index.js           # Function exports
├── ml/                    # Machine learning models
├── hardware/              # IoT sensor configurations
└── docs/                  # Documentation
```

## API Documentation

See [docs/api-spec.md](docs/api-spec.md) for detailed API documentation.

### Current Firebase Structure
```json
{
  "BlueSentinel": {
    "temperature": 25.4,
    "pH": 7.2
  }
}
```

### Planned Cloud Functions
- `GET /api/healthScore` - Calculate marine health score
- `POST /api/alerts` - Send SMS/email alerts
- `GET /api/history` - Get historical data
- `POST /api/export` - Export data as CSV

## Dashboard Features

### Real-time Monitoring
- **5 Sensor Cards**: Temperature, pH, Turbidity, Dissolved O₂, Salinity
- **Live Graph**: Multi-line chart with 30-point rolling window
- **Multiple Y-Axes**: Different scales for different parameters
- **Auto-refresh**: Updates in real-time via Firebase listeners
- **Vibrant Colors**: High-contrast colors visible on dark gradient background

### Current Sensor Status
- ✅ Temperature (DS18B20) - **Real sensor**
- ✅ pH Level - **Real sensor**  
- 🔵 Turbidity - Simulated (frontend)
- 🔵 Dissolved Oxygen - Simulated (frontend)
- 🔵 Salinity - Simulated (frontend)

### Data Flow
```
ESP32 → Firebase Realtime DB → Dashboard
  |           |                      |
  |           |                      +→ Live Cards
  |           |                      +→ Chart.js Graph
  |           +→ /BlueSentinel/temperature
  |           +→ /BlueSentinel/pH
  |
  +→ Reads sensors every 5 seconds
```

## System Architecture

### Hardware Layer
```
ESP32 Dev Module
  ├─ DS18B20 Temperature Sensor (Pin 4)
  ├─ pH Sensor (Pin 32)
  ├─ WiFi Module (built-in)
  └─ Power: 5V USB or battery
```

### Cloud Layer
```
Firebase Realtime Database
  /BlueSentinel/
    ├─ temperature: 25.4
    └─ pH: 7.2
```

### Frontend Layer
```
Dashboard (HTML/CSS/JS)
  ├─ Real-time listeners
  ├─ Chart.js visualization  
  ├─ 5 sensor cards
  └─ Glass morphism UI
```

### Security
- WiFi credentials: Hardcoded in .ino (should use secrets.h)
- Firebase API key: Public (read-only access)
- Database rules: Open for development (needs auth for production)

## Environmental Impact

BlueSentinel addresses critical marine protection challenges:

- **Early Detection**: Identifies pollution events within minutes instead of days
- **Rapid Response**: Enables immediate action before ecological damage becomes irreversible
- **Data-Driven Decisions**: Provides authorities with accurate, real-time environmental intelligence
- **Prevention Focus**: Shifts from reactive cleanup to proactive protection

## Current Limitations

- Only 2 real sensors (Temperature & pH)
- Turbidity, DO, and Salinity are simulated in frontend
- No user authentication
- No SMS/email alerts yet
- Single device support (one ESP32)
- Database rules are wide open (development mode)

## Future Development

### Phase 1: Complete Sensor Suite
- ☐ Add real turbidity sensor
- ☐ Add real dissolved oxygen sensor
- ☐ Add real salinity/conductivity sensor
- ☐ Waterproof enclosure for deployment

### Phase 2: Intelligence & Alerts
- ☐ Firebase Cloud Functions for data processing
- ☐ Health score calculation algorithm
- ☐ Anomaly detection (threshold breaches)
- ☐ Twilio SMS alerts
- ☐ Email notifications

### Phase 3: Scale & Analytics
- ☐ Multi-device support
- ☐ User authentication
- ☐ Historical data export (CSV)
- ☐ ML models for predictions
- ☐ Mobile app (React Native)
- ☐ Geographic mapping of devices

## Contributing

We welcome contributions to help protect our oceans. Please follow these steps:

1. Fork the repository
2. Create a feature branch for your contribution
3. Make your changes with clear documentation
4. Test thoroughly
5. Submit a pull request with a detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

BlueSentinel Team - Protecting Life Below Water

For inquiries, collaboration opportunities, or technical support, please reach out through our project repository.

---

*"You can't protect what you can't see."* - BlueSentinel Mission
