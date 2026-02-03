# System Architecture

BlueSentinel is a comprehensive **IoT ocean monitoring platform** that combines real hardware sensors with cloud infrastructure for real-time water quality monitoring and pollution detection.

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32 Device  │    │  Firebase Cloud │    │   Web Dashboard │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Temperature │ │    │ │ Realtime DB │ │    │ │ Sensor Cards│ │
│ │ pH Sensor   │ │───▶│ │             │ │───▶│ │ Live Graph  │ │
│ │ Turbidity   │ │    │ │ Auth/Hosting│ │    │ │ News Feed   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ WiFi Module    │    │ NewsAPI.org     │    │ Glass Morphism │
│ 5-sec Upload   │    │ Marine News     │    │    UI Design   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### **Hardware Layer**
```
ESP32 Dev Module
├── DS18B20 Temperature Sensor → Pin D4
├── pH Sensor Module         → Pin D32
├── Turbidity Sensor         → Pin D35
├── WiFi Module (built-in)
└── Power: 5V USB/Battery
```

### **Cloud Infrastructure**
```
Firebase Platform
├── Realtime Database    (Primary data store)
├── Authentication       (ESP32 device auth)
├── Hosting             (Web deployment)
└── Cloud Functions      (Planned features)
```

### **Frontend Technologies**
```
Web Dashboard
├── HTML5/CSS3/JavaScript (Vanilla)
├── Chart.js v4.4.0       (Live graphs)
├── Firebase SDK v9.22.0  (Real-time data)
├── Glass Morphism UI     (Design system)
└── Responsive Design     (Mobile-first)
```

### **External APIs**
```
Third-party Services
├── NewsAPI.org          (Marine news)
└── Future APIs
    ├── Twilio           (SMS alerts)
    └── Weather APIs     (Environmental data)
```

## 📊 Data Flow Architecture

### **Real-time Data Pipeline**
```
1. SENSOR READING (Every 5 seconds)
   ESP32 reads sensors:
   ├── DS18B20 → Temperature (°C)
   ├── pH Probe → pH level (0-14)
   └── Turbidity → NTU

2. DATA TRANSMISSION
   ESP32 → WiFi → Firebase Realtime DB
   ├── Authentication: Service account
   ├── Protocol: HTTPS/WebSocket
   └── Format: JSON

3. DATA STORAGE
   Firebase Realtime Database:
   {
     "BlueSentinel": {
       "temperature": 20.5,
       "pH": 6.9709,
       "turbidity": 0.53,
       "timestamp": 1738454400000
     }
   }

4. REAL-TIME CONSUMPTION
   Dashboard ← Firebase WebSocket
   ├── Live sensor cards update
   ├── Chart.js graph refresh
   └── News API integration
```

### **Frontend Data Processing**
```
Firebase Listener (Real-time)
        ↓
Raw Sensor Data (3 parameters)
        ↓
Frontend Enhancement
├── Add simulated DO (6-10 mg/L)
├── Add simulated Salinity (30-37 PSU)
└── Calculate time stamps
        ↓
Dashboard Components
├── 5 Sensor Cards (Glass morphism)
├── Live Graph (30-point window)
└── News Cards (NewsAPI.org)
```

## 🗄️ Database Architecture

### **Current Schema (Production)**
```json
{
  "BlueSentinel": {
    "temperature": 20.5,        // Real sensor data
    "pH": 6.9709,              // Real sensor data
    "turbidity": 0.53,         // Real sensor data
    "timestamp": 1738454400000 // Auto-generated
  }
}
```

### **Planned Schema (Multi-device)**
```json
{
  "BlueSentinel": {
    "devices": {
      "ESP32-001": {
        "location": {
          "lat": 19.0760,
          "lng": 72.8777,
          "name": "Mumbai Harbor"
        },
        "sensors": {
          "temperature": 20.5,
          "pH": 6.9709,
          "turbidity": 0.53
        },
        "status": "online",
        "lastSeen": 1738454400000,
        "batteryLevel": 85
      }
    },
    "alerts": {
      "active": [],
      "history": []
    },
    "healthScore": {
      "overall": 87,
      "factors": {
        "temperature": 95,
        "pH": 85,
        "turbidity": 80
      }
    }
  }
}
```

## 🎨 Frontend Architecture

### **Component Structure**
```
public/
├── dashboard.html          (Main dashboard)
│   ├── Sensor Cards        (5 glass-morphism cards)
│   ├── Live Graph          (Chart.js multi-line)
│   └── Navigation          (Glass-effect bottom nav)
├── news.html              (Marine news feed)
├── logs.html              (Incident logs)
├── profile.html           (User profile)
└── css/
    ├── dashboard.css      (Main styles)
    ├── global.css         (Common components)
    └── [page].css         (Page-specific)
```

### **JavaScript Architecture**
```javascript
// Core initialization
firebase.initializeApp(config)
const db = firebase.database()

// Real-time data listener
db.ref('BlueSentinel').on('value', (snapshot) => {
  const data = snapshot.val()
  
  // 1. Update sensor cards
  updateSensorCards(data)
  
  // 2. Add simulated parameters
  const enrichedData = {
    ...data,
    dissolvedOxygen: generateSimulatedDO(),
    salinity: generateSimulatedSalinity()
  }
  
  // 3. Update live graph
  updateChart(enrichedData)
})

// News API integration
fetchNewsArticles().then(articles => {
  updateNewsCards(articles)
})
```

### **Design System Architecture**
```
Glass Morphism UI
├── Color Palette
│   ├── Primary: #00FFD4 (Cyan)
│   ├── Secondary: #5465FF (Blue)
│   ├── Text: #D2DDFF (Light Blue)
│   └── Background: #050208 (Dark)
├── Components
│   ├── Cards (backdrop-filter: blur(20px))
│   ├── Navigation (floating glass bar)
│   └── Buttons (gradient backgrounds)
└── Responsive Breakpoints
    ├── Mobile: < 640px
    ├── Tablet: 640px - 1024px
    └── Desktop: > 1024px
```

## 🔐 Security Architecture

### **Current Implementation**
```
Security Layers
├── Firebase Authentication
│   └── ESP32 Service Account
├── Database Rules
│   └── Development mode (open access)
├── API Security
│   └── Environment variables
└── Network Security
    └── HTTPS/WSS encryption
```

### **Production Security Plan**
```json
{
  "rules": {
    "BlueSentinel": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.deviceId === 'ESP32-001'
    },
    "devices": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth.token.deviceId === $deviceId"
      }
    }
  }
}
```

## 📡 Network Architecture

### **Communication Protocols**
```
ESP32 → Firebase
├── Protocol: HTTPS (REST API)
├── Authentication: Bearer Token
├── Data Format: JSON
└── Frequency: Every 5 seconds

Firebase → Dashboard
├── Protocol: WebSocket (wss://)
├── Authentication: Firebase SDK
├── Data Format: JSON
└── Latency: < 100ms

Dashboard → NewsAPI
├── Protocol: HTTPS (REST API)
├── Authentication: API Key
├── Data Format: JSON
└── Frequency: Every 30 minutes
```

### **Error Handling & Resilience**
```javascript
// Firebase reconnection logic
db.ref('BlueSentinel').on('value', callback, (error) => {
  switch(error.code) {
    case 'NETWORK_ERROR':
      // Auto-reconnect with exponential backoff
      scheduleReconnect()
      break
    case 'PERMISSION_DENIED':
      // Redirect to login
      handleAuthError()
      break
  }
})

// ESP32 error handling
if (WiFi.status() != WL_CONNECTED) {
  reconnectWiFi()
}

if (!Firebase.ready()) {
  reconnectFirebase()
}
```

## 🚀 Deployment Architecture

### **Hardware Deployment**
```
Deployment Pipeline
1. Development
   ├── Breadboard prototype
   ├── Serial monitoring
   └── Local testing

2. Pre-production
   ├── Waterproof enclosure
   ├── Power management
   └── Field testing

3. Production
   ├── Solar panel + battery
   ├── Weatherproof housing
   └── Remote monitoring site
```

### **Software Deployment**
```
Frontend Deployment
├── Development
│   └── firebase serve (localhost:5000)
├── Staging
│   └── firebase deploy --project staging
└── Production
    └── firebase deploy --project production

ESP32 Deployment
├── Arduino IDE
│   └── USB upload (development)
└── OTA Updates
    └── Wireless firmware updates (planned)
```

## 📈 Performance Architecture

### **Current Performance Metrics**
```
Data Throughput
├── ESP32 Upload: 1 request/5 seconds
├── Firebase Write: ~17,280/day
├── Dashboard Update: Real-time (< 100ms)
└── News API: 48 requests/day

Resource Usage
├── Firebase Storage: < 1 MB
├── Bandwidth: < 10 GB/month
├── Connections: < 10 simultaneous
└── CPU Load: Minimal (client-side)
```

### **Scalability Planning**
```
Horizontal Scaling
├── Multiple ESP32 Devices
│   ├── Unique device IDs
│   ├── Geographic distribution
│   └── Load balancing
├── Firebase Scaling
│   ├── Multi-region deployment
│   ├── Database sharding
│   └── CDN integration
└── Frontend Optimization
    ├── Code splitting
    ├── Lazy loading
    └── Service workers
```

## 🔍 Monitoring & Observability

### **Current Monitoring**
```
Firebase Console
├── Real-time Database Viewer
├── Usage Analytics
├── Error Reporting
└── Performance Monitoring

ESP32 Monitoring
├── Serial Output
├── WiFi Status
├── Sensor Health
└── Battery Level
```

### **Planned Monitoring**
```
Advanced Monitoring
├── Custom Dashboard
│   ├── System health metrics
│   ├── Alert status
│   └── Performance graphs
├── Logging System
│   ├── Structured logs
│   ├── Log aggregation
│   └── Search capabilities
└── Alerting
    ├── Threshold monitoring
    ├── Anomaly detection
    └── Multi-channel notifications
```

## 🗺️ Future Architecture Evolution

### **Phase 2: Intelligence Layer**
```
ML Pipeline
├── Data Collection
│   ├── Historical storage
│   ├── Feature engineering
│   └── Data cleaning
├── Model Training
│   ├── Anomaly detection
│   ├── Prediction models
│   └── Health scoring
└── Real-time Inference
    ├── Cloud Functions
    ├── Edge processing
    └── Alert generation
```

### **Phase 3: Enterprise Scale**
```
Enterprise Architecture
├── Multi-tenant Support
│   ├── Organization management
│   ├── User roles & permissions
│   └── Resource isolation
├── Advanced Analytics
│   ├── BigQuery integration
│   ├── Data visualization
│   └── Custom reporting
└── Integration APIs
    ├── RESTful APIs
    ├── GraphQL endpoints
    └── Webhook support
```

---

## 📞 Architecture Documentation

### **Status Overview**
- ✅ **Core Architecture**: Fully implemented
- ✅ **Real-time Data Flow**: Production ready
- ✅ **Frontend Architecture**: Responsive and scalable
- 🔄 **Security**: Development mode, production planned
- 📋 **Advanced Features**: Planned for future phases

### **Technical Debt & Improvements**
- Add proper error boundaries
- Implement offline support
- Add comprehensive logging
- Optimize bundle size
- Add automated testing

---

*Last Updated: February 2026 | Architecture Version: 1.0 | Status: Production Ready*