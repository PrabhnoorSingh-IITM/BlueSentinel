# BlueSentinel - Ocean Intelligence Platform

<div align="center">
  <h3>A Digital Nervous System for the Ocean</h3>
  <p><strong>Real-time marine monitoring, pollution detection, and ecosystem protection</strong></p>
</div>

---

## Overview

BlueSentinel addresses a critical challenge in marine conservation: the inability to detect water quality degradation in real-time. By the time conventional monitoring identifies a pollution event, ecosystems have often suffered irreversible damage. Our platform bridges this gap with continuous sensor monitoring, intelligent analysis, and immediate alerts.

The system combines IoT hardware with cloud infrastructure to provide authorities and researchers with actionable intelligence about ocean health. We track five critical water quality parameters and present data through an intuitive dashboard designed for rapid decision-making.

**Live Platform**: [https://bluesentinel1.web.app](https://bluesentinel1.web.app)

---

## Features

### Real-Time Water Quality Monitoring
BlueSentinel tracks five essential water quality parameters:
- **Temperature**: Monitors thermal variations that affect marine life
- **pH Level**: Detects acidification and alkalinity changes
- **Turbidity**: Measures water clarity and sediment levels
- **Dissolved Oxygen**: Tracks oxygen availability for aquatic life
- **Salinity**: Monitors salt concentration variations

### Live Dashboard
The dashboard provides immediate visibility into ocean conditions:
- Real-time sensor readings updated every 5 seconds
- Interactive multi-parameter graphs with 30-point history
- Glass morphism UI design optimized for quick comprehension
- Responsive layout supporting mobile, tablet, and desktop devices

### Incident Logging System
Every threshold breach is automatically logged with:
- Timestamp and location data
- Alert severity classification (warning/critical)
- Response action tracking
- Historical incident records

### Marine News Integration
Curated ocean conservation news from reliable sources keeps teams informed about:
- Research breakthroughs in marine science
- Policy changes affecting water quality
- Conservation initiatives and their outcomes
- Best practices from successful interventions

---

## Technology Stack

### Hardware Components
- **ESP32 Development Board**: Primary microcontroller
- **DS18B20 Temperature Sensor**: Waterproof digital temperature measurement
- **pH Sensor Module**: Analog pH detection with calibration support
- **Turbidity Sensor**: Optical clarity measurement
- **WiFi Connectivity**: Built-in ESP32 wireless module

### Cloud Infrastructure
- **Firebase Realtime Database**: Millisecond-latency data synchronization
- **Firebase Hosting**: Global CDN deployment
- **Firebase Authentication**: Secure device and user access
- **Firebase Cloud Functions**: Serverless backend processing

### Frontend Technologies
- **HTML5/CSS3/JavaScript**: Pure vanilla implementation for performance
- **Chart.js 4.4.0**: High-performance data visualization
- **Firebase SDK 9.22.0**: Real-time data binding
- **Glass Morphism Design**: Modern, accessible interface styling

### External Services
- **NewsAPI.org**: Marine conservation news aggregation

---

## System Architecture

BlueSentinel operates as a three-layer system:

**1. Sensor Layer (ESP32)**
   - Reads physical sensors every 5 seconds
   - Validates and formats measurement data
   - Authenticates with Firebase
   - Uploads readings via HTTPS

**2. Cloud Layer (Firebase)**
   - Stores incoming sensor data in real-time database
   - Triggers cloud functions for threshold monitoring
   - Serves static assets via CDN
   - Manages authentication and access control

**3. Presentation Layer (Web Dashboard)**
   - Subscribes to real-time database changes
   - Updates UI elements dynamically
   - Renders multi-axis time-series graphs
   - Handles user interactions and navigation

Data flows unidirectionally from sensors through the cloud to visualization, ensuring consistency and reducing latency.

---

## Getting Started

### View Live Dashboard
Visit [https://bluesentinel1.web.app](https://bluesentinel1.web.app) to explore the platform.

### Run Locally

**Prerequisites**:
- Node.js 16+ and npm
- Firebase CLI
- Git

**Installation**:
```bash
# Clone repository
git clone https://github.com/PrabhnoorSingh-IITM/BlueSentinel.git
cd BlueSentinel

# Install dependencies
npm install

# Serve locally
firebase serve
```

Navigate to `http://localhost:5000` to access the dashboard.

### Deploy to Firebase

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Authenticate
firebase login

# Deploy hosting
firebase deploy --only hosting
```

---

## Hardware Setup

### Required Components
- ESP32 Dev Module
- DS18B20 waterproof temperature sensor
- pH sensor module with BNC connector
- Turbidity sensor with analog output
- Jumper wires and breadboard
- 5V power supply or USB cable

### Wiring Diagram
```
ESP32 GPIO    Sensor         Connection
─────────────────────────────────────────
GPIO 4    →   DS18B20       Data line
GPIO 32   →   pH Sensor     Analog output
GPIO 35   →   Turbidity     Analog output
3.3V      →   Sensors       Power (VCC)
GND       →   Sensors       Ground
```

### Firmware Configuration

1. Install Arduino IDE and ESP32 board support
2. Add required libraries:
   - Firebase_ESP_Client
   - OneWire
   - DallasTemperature

3. Update `hardware/esp32/BlueSentinel/src/config.h`:
   ```cpp
   #define WIFI_SSID "your_network_name"
   #define WIFI_PASSWORD "your_password"
   #define API_KEY "your_firebase_api_key"
   #define DATABASE_URL "https://your-project.firebaseio.com"
   ```

4. Upload firmware to ESP32 and monitor serial output at 115200 baud

---

## Project Structure

```
BlueSentinel/
├── public/                    # Frontend application
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript modules
│   │   ├── dashboard.js      # Main dashboard logic
│   │   ├── logs.js          # Incident logging
│   │   ├── news.js          # News integration
│   │   └── core/            # Firebase initialization
│   ├── assets/              # Images and static resources
│   ├── dashboard.html       # Main dashboard
│   ├── news.html           # Marine news page
│   ├── logs.html           # Incident logs
│   ├── contact.html        # Team and documentation
│   └── index.html          # Landing page
├── hardware/
│   └── esp32/
│       └── BlueSentinel/    # Arduino firmware
├── functions/               # Firebase cloud functions
│   ├── api/                # API endpoints
│   └── triggers/           # Database triggers
├── docs/                   # Technical documentation
├── firebase.json          # Firebase configuration
├── package.json          # Node dependencies
└── README.md            # This file
```

---

## Database Schema

### Sensor Data Node
```json
{
  "BlueSentinel": {
    "temperature": 24.5,
    "pH": 7.8,
    "turbidity": 2.3,
    "dissolvedOxygen": 8.2,
    "salinity": 35.0,
    "timestamp": 1738454400000
  }
}
```

### Update Frequency
- **Sensor reading interval**: 5 seconds
- **Dashboard refresh rate**: Real-time (WebSocket)
- **Graph data points**: Rolling 30-point window

---

## Security

BlueSentinel implements multiple security layers:

- **Device Authentication**: ESP32 uses service account credentials for database access
- **Firebase Security Rules**: Database rules restrict unauthorized reads/writes
- **HTTPS Encryption**: All data transmission uses TLS 1.3
- **API Key Protection**: Sensitive keys stored in environment configuration

For production deployments, additional security measures are recommended:
- User authentication with role-based access control
- Rate limiting on API endpoints
- Audit logging for compliance
- Regular security audits and penetration testing

---

## Environmental Impact

### Immediate Benefits
- **Early Detection**: Identify contamination events within minutes instead of days
- **Rapid Response**: Provide authorities with real-time data for faster intervention
- **Ecosystem Protection**: Prevent irreversible damage through proactive monitoring
- **Cost Efficiency**: Reduce cleanup costs by catching problems early

### Long-Term Vision
BlueSentinel aims to become a scalable platform for comprehensive ocean health monitoring. Future development will focus on:
- Geographic expansion with networked sensor arrays
- Machine learning models for predictive analytics
- Integration with government response systems
- Open data initiatives for marine research

---

## Development Roadmap

### Current Capabilities
- ✅ Three hardware sensors operational (Temperature, pH, Turbidity)
- ✅ Real-time Firebase integration
- ✅ Live dashboard with multi-parameter graphing
- ✅ Responsive web design
- ✅ Incident logging system
- ✅ Marine news integration

### Near-Term Goals
- Threshold-based automated alerts via SMS/email
- Historical data storage and trend analysis
- Multi-device support with location tracking
- Enhanced anomaly detection algorithms
- Data export functionality (CSV/JSON)

### Long-Term Objectives
- Mobile application for field teams
- Machine learning models for water quality prediction
- Interactive geographic mapping interface
- Integration with environmental agencies
- Community-driven sensor network expansion

---

## Team

BlueSentinel is developed by a team of engineers and developers passionate about ocean conservation:

- **Prabhnoor Singh** - Lead Developer & Project Lead
- **Mehak Kaur** - IoT & Hardware Engineer  
- **Jaisveen Kaur** - ML & Analytics Engineer
- **Prabhleen Kaur** - Frontend & UX Engineer

For detailed team information and project documentation, visit the [Contact page](https://bluesentinel1.web.app/contact.html).

---

## Contributing

We welcome contributions from developers, researchers, and ocean enthusiasts. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes with clear messages
4. Push to your fork (`git push origin feature/enhancement`)
5. Open a pull request with a detailed description

Please review our architecture and API documentation in the `docs/` directory before contributing.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Contact

**GitHub Repository**: [https://github.com/PrabhnoorSingh-IITM/BlueSentinel](https://github.com/PrabhnoorSingh-IITM/BlueSentinel)

**Live Platform**: [https://bluesentinel1.web.app](https://bluesentinel1.web.app)

For project inquiries, collaboration opportunities, or technical support, please open an issue on GitHub or visit our [contact page](https://bluesentinel1.web.app/contact.html).

---

<div align="center">
  <p><em>"Real-time visibility, proactive protection, sustainable oceans."</em></p>
  <p><strong>BlueSentinel - Protecting Life Below Water</strong></p>
</div>
