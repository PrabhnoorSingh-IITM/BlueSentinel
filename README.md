# BlueSentinel - Ocean Intelligence Platform

<div align="center">
  <h3>A Digital Nervous System for the Ocean</h3>
  <p><strong>Real-time marine monitoring, early pollution detection, and rapid response</strong></p>
  <p><em>Team Project for Hackathon | Currently 10% Complete</em></p>
</div>

## 🌊 Overview

BlueSentinel is a comprehensive IoT ocean monitoring platform that combines **real hardware sensors** with **cloud infrastructure** to detect water quality issues before they become environmental disasters. Currently deployed with **3 real sensors** (Temperature, pH, Turbidity) on ESP32, with simulated data for dissolved oxygen and salinity.

**Current Status**: 🔧 **Active Development** | 📊 **Live Sensor Data** | 🚀 **Hackathon Ready**

## ✨ Key Features

### 🎯 **Fully Working**
- **Live Water Quality Monitoring**: Real-time tracking of 5 parameters
  - ✅ **Temperature** (DS18B20) - Real sensor
  - ✅ **Water pH** - Real sensor  
  - ✅ **Turbidity** - Real sensor
  - 🔵 **Dissolved Oxygen** - Simulated
  - 🔵 **Salinity** - Simulated
- **Real-time Dashboard**: Chart.js live graphs with 30-point rolling window
- **Glass Morphism UI**: Modern dark theme with vibrant colors (#00FFD4, #5465FF, #D2DDFF)
- **Firebase Integration**: Real-time database with instant updates
- **ESP32 Hardware**: 3 waterproof sensors uploading every 5 seconds
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🔄 **Partially Working**
- **Sensor Integration**: Real-time data flowing from ESP32 to dashboard
- **Backend Infrastructure**: Firebase Realtime Database operational
- **News Integration**: Marine conservation updates via NewsAPI

### 🚀 **Planned Features**
- **ML Models**: AI-powered environmental predictions and anomaly detection
- **Government/NGO Integration**: Alert systems for authorities
- **Health Score**: Comprehensive marine ecosystem health index
- **Multi-device Support**: Multiple ESP32 deployment
- **Historical Data Export**: CSV download functionality
- **Mobile App**: React Native application
- **Geographic Mapping**: Device location tracking

## 🛠️ Technology Stack

### **Hardware Layer**
```
ESP32 Dev Module
  ├─ DS18B20 Temperature Sensor → Pin D4
  ├─ pH Sensor → Pin D32  
  ├─ Turbidity Sensor → Pin D35
  ├─ WiFi Module (built-in)
  └─ Power: 5V USB or battery pack
```

### **Frontend**
- **HTML5, CSS3, JavaScript** (Vanilla)
- **Chart.js v4.4.0** for live graphs
- **Firebase SDK v9.22.0** for real-time data
- **Glass Morphism Design System** with custom color palette
- **Responsive Mobile-First Architecture**

### **Backend & Cloud**
- **Firebase Realtime Database** (Primary data store)
- **Firebase Authentication** (ESP32 device auth)
- **Firebase Hosting** (Web deployment)
- **ESP32 Firmware** (Arduino/C++)
- **NewsAPI.org** (Marine news integration)

### **APIs Currently Used**
1. **Firebase Realtime Database** - Core data storage
2. **NewsAPI.org** - Marine news aggregation

## 🚀 Quick Start

### **View Live Dashboard**
1. **Clone and serve locally**:
   ```bash
   git clone https://github.com/PrabhnoorSingh-IITM/BlueSentinel.git
   cd BlueSentinel
   firebase serve
   # Navigate to http://localhost:5000
   ```

2. **Direct file access**:
   ```bash
   # Open public/dashboard.html directly in browser
   ```

### **Deploy to Firebase**
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize project (if not done)
firebase init

# 4. Deploy to hosting
firebase deploy
```

### **Hardware Setup**

#### **Required Components**
- ESP32 Development Board
- DS18B20 Waterproof Temperature Sensor
- pH Sensor Module
- Turbidity Sensor Module
- Jumper wires
- Breadboard
- 5V Power supply

#### **Wiring Diagram**
```
ESP32 Pin    →    Sensor
─────────────────────────────
D4 (GPIO4)   →    DS18B20 Data
D32 (GPIO32) →    pH Sensor Analog
D35 (GPIO35) →    Turbidity Sensor Analog
3.3V/5V      →    Sensor Power
GND          →    Sensor Ground
```

#### **ESP32 Code Setup**
1. **Install Arduino Libraries**:
   ```
   - Firebase_ESP_Client
   - OneWire
   - DallasTemperature
   ```

2. **Update Configuration**:
   ```cpp
   #define WIFI_SSID "Your_WiFi_Name"
   #define WIFI_PASSWORD "Your_WiFi_Password"
   #define API_KEY "Your_Firebase_API_Key"
   #define DATABASE_URL "https://your-project.firebaseio.com"
   ```

3. **Upload Firmware**:
   - Open Arduino IDE
   - Select Board: "ESP32 Dev Module"
   - Upload the sketch

4. **Monitor Serial Output**:
   - Open Serial Monitor (115200 baud)
   - Verify data uploads every 5 seconds

## 📊 Current Data Flow

```
ESP32 Sensors → Firebase Realtime DB → Dashboard
     │                │                      │
     │                │                      ├─ Live Sensor Cards
     │                │                      ├─ Real-time Chart.js Graph
     │                │                      └─ News Integration
     │                └─ /BlueSentinel/
     ├─ temperature: 20.5
     ├─ pH: 6.9709
     └─ turbidity: 0.53
```

## 📁 Project Structure

```
BlueSentinel/
├── 📁 public/                 # Frontend web application
│   ├── 📁 css/              # Stylesheets (glass morphism design)
│   ├── 📁 js/               # JavaScript files
│   │   ├── dashboard.js     # Real-time dashboard logic
│   │   ├── news.js          # News integration
│   │   └── core/            # Firebase initialization
│   ├── 📁 assets/           # Images and static assets
│   ├── dashboard.html       # Main dashboard page
│   ├── news.html           # Marine news page
│   ├── logs.html           # Incident logs
│   └── profile.html        # User profile
├── 📁 functions/            # Firebase Cloud Functions
│   └── api/                # API endpoints
├── 📁 hardware/            # ESP32 firmware and schematics
│   └── esp32/
├── 📁 docs/                # Documentation
│   ├── diagrams/           # Circuit diagrams
│   ├── api-spec.md         # API documentation
│   ├── architecture.md     # System architecture
│   └── workflow.md         # Development workflow
├── 📄 firebase.json        # Firebase configuration
├── 📄 package.json         # Node.js dependencies
└── 📄 README.md            # This file
```

## 🎨 UI/UX Design System

### **Color Palette**
- **Primary**: `#00FFD4` (Cyan) - Live data, active states
- **Secondary**: `#5465FF` (Blue) - Graphs, accents
- **Text**: `#D2DDFF` (Light Blue) - Readable text
- **Background**: `#050208` (Dark) - Main background
- **Gradient**: `Linear(135deg, #050208, #1a0f2e, #0a1628)`

### **Design Principles**
- **Glass Morphism**: Frosted glass effect with backdrop blur
- **High Contrast**: Vibrant colors on dark background
- **Responsive**: Mobile-first design approach
- **Real-time**: Live data updates with smooth transitions

## 🔧 Firebase Database Structure

### **Current Schema**
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

### **Data Update Frequency**
- **Upload Interval**: Every 5 seconds
- **Data Points**: 30-point rolling window on dashboard
- **Storage**: Real-time updates, no historical persistence yet

## 📱 Dashboard Features

### **Live Sensor Cards**
- **5 Parameter Cards**: Temperature, pH, Turbidity, Dissolved O₂, Salinity
- **Real-time Updates**: Instant Firebase listener updates
- **Glass Morphism Design**: Modern frosted glass effect
- **Hover Animations**: Smooth transitions and micro-interactions

### **Interactive Graph**
- **Multi-line Chart**: All 5 parameters on same timeline
- **Multiple Y-Axes**: Different scales for different parameters
- **30-Point Window**: Rolling window of last 30 readings
- **High-Contrast Colors**: Each parameter has distinct color
- **Responsive Sizing**: Adapts to screen size

### **News Integration**
- **Marine News**: Real-time ocean conservation news
- **API Integration**: NewsAPI.org for reliable sources
- **Card-based Layout**: Modern news display with glass morphism

## 🏗️ System Architecture

### **Hardware Layer**
```
ESP32 Microcontroller
  ├─ Sensor Reading (Every 5 seconds)
  ├─ WiFi Communication
  ├─ Firebase Authentication
  └─ Data Upload to Realtime DB
```

### **Cloud Layer**
```
Firebase Realtime Database
  ├─ /BlueSentinel/ (Data Node)
  ├─ Real-time Listeners
  ├─ Device Authentication
  └─ Web Hosting
```

### **Frontend Layer**
```
Web Dashboard
  ├─ Firebase SDK Integration
  ├─ Chart.js Visualization
  ├─ Real-time UI Updates
  └─ Responsive Design
```

## 🔐 Security Considerations

### **Current Implementation**
- **Firebase Authentication**: Device-level authentication for ESP32
- **Database Rules**: Configured for secure access
- **API Keys**: Environment-specific configuration

### **Production Recommendations**
- Implement user authentication for dashboard access
- Add data encryption for sensitive sensor data
- Set up proper Firebase security rules
- Implement rate limiting for API calls

## 🌍 Environmental Impact

### **Direct Benefits**
- **Early Detection**: Identify pollution events before ecosystem damage
- **Real-time Monitoring**: Continuous water quality assessment
- **Data-driven Decisions**: Provide authorities with actionable intelligence
- **Prevention Focus**: Shift from reactive cleanup to proactive protection

### **Long-term Vision**
- **Ecosystem Protection**: Safeguard marine biodiversity
- **Pollution Reduction**: Enable rapid response to contamination
- **Research Support**: Provide valuable data for marine scientists
- **Policy Making**: Inform environmental regulations

## 🚧 Current Limitations

### **Technical**
- **Historical Data**: No long-term data storage yet
- **Multi-device**: Single ESP32 support currently
- **Alert System**: No automated notifications yet
- **Health Score**: Algorithm not implemented

### **Hardware**
- **Sensor Coverage**: 3 real sensors, 2 simulated
- **Power Management**: No battery optimization yet
- **Enclosure**: Not yet waterproof for deployment

## 🗺️ Development Roadmap

### **Phase 1: Core Completion (Current)**
- ✅ Real sensor integration (Temperature, pH, Turbidity)
- ✅ Firebase real-time dashboard
- ✅ Glass morphism UI design
- ✅ Responsive web interface

### **Phase 2: Intelligence & Alerts (Next 2-3 Months)**
- 🔄 Health score calculation algorithm
- 🔄 Anomaly detection system
- 🔄 SMS/email alert integration
- 🔄 Historical data storage
- 🔄 Multi-device support

### **Phase 3: Scale & Advanced Features (6+ Months)**
- 📋 Mobile app development (React Native)
- 📋 ML models for predictions
- 📋 Geographic mapping interface
- 📋 Government/NGO integration
- 📋 Advanced analytics dashboard

## 👥 Team & Collaboration

### **Hackathon Project**
- **Team Size**: Multi-member team
- **Development Style**: Collaborative, rapid prototyping
- **Target Audience**: Hackathon judges, environmental agencies
- **Open Source**: Available for community contribution

### **Contributing Guidelines**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Contact & Support

### **Project Links**
- **GitHub Repository**: https://github.com/PrabhnoorSingh-IITM/BlueSentinel
- **Live Demo**: [Will be available after Firebase deployment]
- **Documentation**: See `/docs` folder for detailed guides

## Contact

BlueSentinel Team - Protecting Life Below Water

For inquiries, collaboration opportunities, or technical support, please reach out through our project repository.

---

*"You can't protect what you can't see."* - BlueSentinel Mission
