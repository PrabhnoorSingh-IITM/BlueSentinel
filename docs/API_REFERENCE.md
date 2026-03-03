# BlueSentinel | API & Technical Integration Reference

This document provides a precise technical breakdown for developers and environmental scientists interacting with the BlueSentinel ecosystem. It covers the data schemas, real-time ingestion protocols, and AI integration bridges.

## 1. Real-Time Data Schema (Firebase)

BlueSentinel utilizes the Firebase Realtime Database for state management. This ensures that every dashboard instance across the world remains synchronized with sub-second accuracy.

### 📡 Latest Telemetry (`sensors/latest`)

This node holds the most recent "Expert Audit" from the field sensors. It is updated every time a sensor node pushes data.

```json
{
  "temperature": 24.5,      // Degrees Celsius
  "ph": 7.8,                // 0-14 Scale
  "turbidity": 2.3,         // NTU (Higher = more opaque)
  "dissolvedOxygen": 8.5,   // mg/L (Vital for aquatic life)
  "timestamp": 1738454400000 // Server-side epoch
}
```

### 🗺️ Incident Ingestion (`incidents/{id}`)

Populates the 3D Globe G.I.S. visualization. Incidents are flagged automatically by the Gemini AI or the expert fallback system.

```json
{
  "type": "Critical",       // Status Level
  "location": {             // GIS Coordinates
    "lat": 12.97, 
    "lng": 77.59 
  },
  "message": "Heavy Metal Anomaly Detected",
  "timestamp": 1738454400000
}
```

## 2. Intelligence & Reasoning (Gemini Bridge)

The BlueSentinel AI Chatbot and Dashboard analysis are powered by a specialized integration of **Gemini 2.0 Flash**.

- **Persona Bridging**: The assistant operates under the "Sentinel Buddy" persona—a proactive river ecologist.
- **Contextual Ingestion**: Current sensor values are injected into the LLM context to ensure responses are grounded in real-time data, not generalities.
- **Threshold Analysis**: The AI specifically looks for breaches in the Indian Standard for Drinking Water (IS 10500) to flag health risks.

## 3. Hardware Ingestion Protocol

While production nodes use optimized Wi-Fi protocols, developer testing can be performed via standard REST requests.

**Endpoint Architecture**:
`POST https://<project-id>.firebaseio.com/sensors/history.json?auth=<access-token>`

**Payload Structure**:

```json
{
  "temperature": 26.5,
  "ph": 6.8,
  "turbidity": 1.1,
  "dissolvedOxygen": 8.9,
  "timestamp": { ".sv": "timestamp" }
}
```

## 4. Environment & Tooling

To maintain the project's performance, we utilize specific CDN-linked assets for core data visualization:

- **Globe.gl**: High-contrast geospatial rendering.
- **Chart.js**: Real-time telemetry streaming graphs.
- **Bootstrap Icons**: Standardized UI iconography.

---
**BlueSentinel Technical Team | 2026**
