# System Architecture

## Overview

BlueSentinel is designed as a distributed real-time monitoring system that combines edge computing, cloud infrastructure, and responsive web interfaces. The architecture prioritizes low latency, high availability, and horizontal scalability to support deployment across multiple geographic locations.

This document describes the system's technical architecture, data flows, component interactions, and design decisions that enable reliable ocean monitoring at scale.

---

## Architecture Principles

### 1. Real-Time First
All components are optimized for minimal latency:
- Sensor readings transmitted every 5 seconds
- WebSocket connections for instant UI updates
- No polling delays or batch processing
- Sub-second end-to-end data delivery

### 2. Unidirectional Data Flow
Data flows in a single direction from hardware to cloud to presentation:
```
Sensors → ESP32 → Firebase → Dashboard
```
This eliminates race conditions and simplifies debugging while ensuring data consistency across all clients.

### 3. Stateless Backend
Firebase Cloud Functions are designed to be stateless and idempotent:
- No server-side session management
- Functions can scale independently
- Database acts as single source of truth
- Automatic recovery from failures

### 4. Progressive Enhancement
The web interface works across all modern browsers:
- Core functionality requires only basic JavaScript
- Advanced features degrade gracefully
- Mobile-first responsive design
- Accessibility-first approach (WCAG 2.1 AA)

---

## System Components

### Layer 1: Edge Hardware (ESP32)

**Role**: Physical sensor interface and data acquisition

**Components**:
- ESP32 microcontroller (Xtensa dual-core @ 240MHz)
- DS18B20 digital temperature sensor
- Analog pH sensor module
- Analog turbidity sensor
- WiFi radio (802.11 b/g/n)

**Responsibilities**:
1. Initialize sensor hardware at boot
2. Read sensor values at 5-second intervals
3. Apply calibration coefficients
4. Validate reading ranges (sanity checks)
5. Format data as JSON payload
6. Authenticate with Firebase
7. Upload via HTTPS POST request
8. Handle connection errors with exponential backoff

**Power Consumption**: ~150mA active, ~10mA deep sleep

**Data Transmission**:
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

**Error Handling**:
- Network disconnections: 10-second retry with exponential backoff (max 5 minutes)
- Sensor failures: Log error, send null value, alert via serial
- Out-of-range readings: Discard and log anomaly

---

### Layer 2: Cloud Infrastructure (Firebase)

#### Firebase Realtime Database

**Role**: Central data store with millisecond synchronization

**Schema Design**:
```
BlueSentinel/ (root node)
├── temperature: 24.5
├── pH: 7.8
├── turbidity: 2.3
├── dissolvedOxygen: 8.2
├── salinity: 35.0
└── timestamp: 1738454400000

incidents/ (logs node)
├── {pushId1}/
│   ├── type: "alert"
│   ├── parameter: "pH"
│   ├── value: 5.2
│   ├── timestamp: 1738454400000
│   ├── severity: "critical"
│   └── status: "investigating"
└── {pushId2}/
    └── ...
```

**Security Rules**:
```json
{
  "rules": {
    "BlueSentinel": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "incidents": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$incidentId": {
        ".validate": "newData.hasChildren(['type', 'parameter', 'value', 'timestamp'])"
      }
    }
  }
}
```

**Performance Characteristics**:
- Read latency: <100ms (95th percentile)
- Write latency: <50ms (95th percentile)
- Concurrent connections: 200,000+ supported
- Throughput: 1000 writes/second per database

**Data Retention**:
- Live sensor data: Overwritten each update (single node)
- Incident logs: Persistent (queried with Firebase queries)
- Historical analytics: Exported to Cloud Storage (future)

#### Firebase Hosting

**Role**: Global content delivery network for static assets

**Configuration**:
- Single-page application routing
- Custom domain: bluesentinel1.web.app
- Auto-SSL via Let's Encrypt
- Brotli compression enabled
- Cache-Control headers optimized

**CDN Distribution**:
Files cached at 200+ edge locations globally, reducing load times to <50ms for 90% of users.

**Asset Optimization**:
- HTML/CSS/JS minification
- Gzip/Brotli compression
- Image lazy loading
- Preconnect hints for Firebase SDK

#### Firebase Cloud Functions (Planned)

**Role**: Serverless event processing and API endpoints

**Planned Triggers**:

1. **onSensorWrite**: Threshold monitoring
   ```javascript
   exports.onSensorWrite = functions.database
     .ref('/BlueSentinel')
     .onWrite((change, context) => {
       const data = change.after.val();
       // Check thresholds
       // Create incident logs
       // Send SMS/email alerts
     });
   ```

2. **onIncidentLog**: Alert distribution
   ```javascript
   exports.onIncidentLog = functions.database
     .ref('/incidents/{incidentId}')
     .onCreate((snapshot, context) => {
       // Send notifications via Twilio
       // Update dashboard statistics
     });
   ```

**API Endpoints** (Future):
- `/api/healthScore`: Calculate composite water quality score
- `/api/predictions`: ML model inference for trend forecasting
- `/api/chatbot`: Natural language query interface

---

### Layer 3: Web Application

#### Frontend Architecture

**Technology Stack**:
- Pure vanilla JavaScript (no frameworks for minimal bundle size)
- HTML5 semantic markup
- CSS3 with custom properties (variables)
- Chart.js for visualization

**Module Structure**:
```
public/js/
├── core/
│   ├── firebase-init.js      # SDK initialization
│   ├── auth.js               # Authentication logic
│   ├── constants.js          # Shared configuration
│   └── utils.js              # Helper functions
├── realtime/
│   ├── sensor-stream.js      # Real-time data subscription
│   ├── health-score.js       # Score calculation
│   └── alerts.js             # Alert handling
├── charts/
│   ├── temp-chart.js         # Temperature graph
│   ├── ph-chart.js           # pH level graph
│   └── turbidity-chart.js    # Turbidity graph
├── ai/
│   ├── insights.js           # AI-driven analysis
│   └── predictions.js        # Trend forecasting
└── pages/
    ├── dashboard.js          # Dashboard controller
    ├── logs.js               # Incident logs
    └── news.js               # News aggregation
```

**State Management**:
Global state stored in plain JavaScript objects:
```javascript
const appState = {
  currentUser: null,
  sensorData: {
    temperature: [],
    pH: [],
    turbidity: [],
    dissolvedOxygen: [],
    salinity: []
  },
  alerts: [],
  lastUpdate: null
};
```

State updates trigger UI re-renders via event listeners.

**Real-Time Data Binding**:
```javascript
database.ref('BlueSentinel').on('value', (snapshot) => {
  const data = snapshot.val();
  updateSensorCards(data);
  updateGraphs(data);
  checkThresholds(data);
});
```

#### Visualization Strategy

**Chart.js Configuration**:
- Line charts with transparent fills
- Dual Y-axes for multi-parameter display
- 30-point rolling window (2.5 minutes of history)
- Automatic scaling with min/max buffers
- Responsive canvas sizing

**Performance Optimizations**:
- Canvas rendering (hardware accelerated)
- requestAnimationFrame for smooth updates
- Debounced resize handlers
- Virtual scrolling for log lists

#### Responsive Design

**Breakpoints**:
- Mobile: 320px - 767px (single column)
- Tablet: 768px - 1023px (two columns)
- Desktop: 1024px+ (three columns)

**Mobile Optimizations**:
- Touch-friendly 44px minimum tap targets
- Simplified navigation menu
- Lazy loading for news images
- Reduced animation complexity

---

## Data Flow Diagrams

### Sensor to Dashboard Flow

```
┌──────────┐
│  ESP32   │ Reads sensors every 5s
└─────┬────┘
      │ HTTPS POST
      ▼
┌─────────────────┐
│ Firebase RTDB   │ Stores latest values
└────────┬────────┘
         │ WebSocket
         ▼
┌───────────────────┐
│ Dashboard Client  │ Updates UI in real-time
└───────────────────┘
```

### Threshold Breach Flow

```
┌──────────┐
│  Sensor  │ Reports pH = 5.2
└─────┬────┘
      │
      ▼
┌─────────────────┐
│ logs.js (client)│ Detects threshold violation
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Firebase /incidents │ Creates log entry
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│ Dashboard UI         │ Displays alert badge
└──────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

**Multi-Device Support**:
Current architecture supports adding devices without code changes:
1. Each device writes to its own database path: `/devices/{deviceId}/`
2. Dashboard subscribes to all device paths
3. Geographic map displays device locations

**Database Sharding**:
For deployments exceeding 1000 concurrent devices:
- Shard by geographic region
- Use Firebase namespaces
- Implement aggregation layer

### Performance Budgets

**Dashboard Load Time**: <2 seconds on 3G
- HTML: 15KB gzipped
- CSS: 25KB gzipped
- JavaScript: 80KB gzipped (including Chart.js)
- Firebase SDK: 40KB gzipped

**Real-Time Latency**: <500ms end-to-end
- Sensor read: 50ms
- Network upload: 200ms
- Firebase propagation: 100ms
- UI render: 50ms

### Cost Optimization

**Firebase Pricing** (pay-as-you-go):
- Realtime Database: $5/GB stored, $1/GB downloaded
- Hosting: $0.026/GB transferred
- Functions: $0.40/million invocations

**Estimated Monthly Costs** (single device):
- Storage: ~$0.10 (20MB data)
- Bandwidth: ~$0.50 (5GB transferred)
- Functions: ~$2.00 (500k threshold checks)
- **Total: ~$3/month per device**

---

## Security Architecture

### Authentication Flow

```
┌─────────┐         ┌──────────────┐
│  ESP32  │────────▶│   Firebase   │
└─────────┘         │     Auth     │
  Service           └───────┬──────┘
  Account                   │
                            │ JWT Token
┌─────────┐                │
│Dashboard│◀───────────────┘
└─────────┘
  User Login
```

### Security Layers

1. **Transport Security**:
   - TLS 1.3 encryption for all connections
   - Certificate pinning on ESP32
   - HTTPS-only hosting

2. **Authentication**:
   - ESP32: Service account with limited scope
   - Users: Email/password or OAuth providers
   - Token refresh every 60 minutes

3. **Authorization**:
   - Firebase Security Rules enforce read/write permissions
   - Device-level access control (future)
   - Role-based access for admin functions

4. **Data Validation**:
   - Client-side input sanitization
   - Server-side schema validation
   - Rate limiting on write operations

### Attack Surface Mitigation

**Known Vulnerabilities**:
- API keys exposed in client code (Firebase best practice)
- No IP whitelisting (planned for production)
- Limited rate limiting (Firebase has default quotas)

**Mitigation Strategies**:
- Firebase Security Rules restrict unauthorized access
- App Check (planned) prevents API abuse
- Regular dependency updates for CVEs
- Penetration testing before production

---

## Monitoring and Observability

### Metrics (Planned)

**Infrastructure Metrics**:
- Firebase RTDB read/write operations per second
- Hosting bandwidth consumption
- Function execution duration and error rate
- Database connection count

**Application Metrics**:
- Sensor reading frequency (expected: 0.2 Hz)
- Dashboard page load time (p50, p95, p99)
- Alert generation rate
- User session duration

**Business Metrics**:
- Active sensor deployments
- Incident response times
- Threshold breach frequency
- Data coverage percentage

### Logging Strategy

**ESP32 Logs**:
- Serial output at 115200 baud
- Log levels: DEBUG, INFO, WARN, ERROR
- Timestamped entries with microsecond precision

**Cloud Function Logs**:
- Structured JSON logs to Cloud Logging
- Error tracking with Sentry (future)
- Request tracing with correlation IDs

**Frontend Logs**:
- Browser console for development
- Google Analytics for user behavior (privacy-preserving)
- Error boundary components for crash reporting

---

## Disaster Recovery

### Backup Strategy

**Database Backups**:
- Firebase Realtime Database exports (manual)
- Daily automated backups to Cloud Storage (planned)
- 30-day retention policy

**Code Repository**:
- Git repository on GitHub
- Protected main branch with required reviews
- Tagged releases for version history

### Failure Scenarios

**ESP32 Network Loss**:
- Retry with exponential backoff (10s → 5m)
- Cache readings locally (limited by RAM)
- Alert via LED status indicator

**Firebase Outage**:
- Dashboard displays "Reconnecting..." message
- Data buffered until connection restored
- No data loss (Firebase handles queue)

**Client Browser Crash**:
- Page reload recovers latest state from database
- No persistent local storage required
- Stateless session design prevents corruption

---

## Future Enhancements

### Phase 1: Intelligence Layer
- Machine learning model for anomaly detection
- Predictive analytics for water quality trends
- Automated threshold tuning based on historical data

### Phase 2: Distribution
- Mobile application (React Native)
- Geographic mapping with device clustering
- Multi-tenant support for organizations

### Phase 3: Integration
- Government API integration for compliance reporting
- Webhook system for third-party integrations
- Export API for research data sharing

---

## Conclusion

BlueSentinel's architecture is designed for reliability, scalability, and real-time performance. The system leverages managed cloud services to minimize operational overhead while maintaining flexibility for future enhancements.

Key architectural strengths:
- **Low latency**: Sub-second data propagation
- **High availability**: 99.95% uptime SLA (Firebase)
- **Cost efficiency**: ~$3/month per device
- **Developer experience**: Simple deployment, clear abstractions

The modular design allows individual components to be upgraded or replaced without affecting the entire system, ensuring long-term maintainability as the platform evolves.
