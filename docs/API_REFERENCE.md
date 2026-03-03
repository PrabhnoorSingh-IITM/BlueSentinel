# BlueSentinel | API & Integration Reference

## 🚀 Overview

This reference provides technical details for interacting with the BlueSentinel ecosystem, including the Firebase data schema, Gemini AI prompt structures, and hardware ingestion protocols.

---

## 1. Firebase Data Schema

### Real-Time Sensors (`BlueSentinel/sensors/latest`)

The current "Source of Truth" written by the river nodes.

```json
{
  "temperature": 24.5,
  "pH": 7.8,
  "turbidity": 2.3,
  "dissolvedOxygen": 8.5,
  "timestamp": 1738454400000
}
```

### Geographic Incident Logs (`incidents/{id}`)

Populates the 3D Globe visualization.

```json
{
  "type": "Critical",
  "location": { "lat": 12.97, "lng": 77.59 },
  "message": "pH drop detected",
  "timestamp": 1738454400000
}
```

### Community Reports (`forum_posts/{id}`)

Powers the real-time community field report feed.

---

## 2. Intelligence Integration

### Gemini AI Prompting

The SentinelBuddy assistant uses a specific context-aware prompt structure defined in `ai-chatbot.js`.

- **Context Injection**: Current sensor values are injected into a specialized "River Ecologist" persona.
- **Persona**: SentinelBuddy acts as a proactive, scientific, yet accessible expert.
- **Logic**: Analyzes pH, Turbidity, and DO to categorize water health (Good, Fair, Critical).

---

## 3. Hardware Ingestion (ESP32)

To push data from an unauthorized device (for development/testing), use the REST endpoint:

**Endpoint**: `POST https://<firebase-project>.firebaseio.com/BlueSentinel.json?auth=<SECRET_KEY>`

**Header**: `Content-Type: application/json`
**Body**:

```json
{
  "temperature": 25.0,
  "pH": 7.0,
  "turbidity": 0.0,
  "dissolvedOxygen": 9.0,
  "timestamp": { ".sv": "timestamp" }
}
```

---

## 4. Environment Configuration

- **Firebase SDK**: Version 9 (compat mode).
- **Gemini SDK**: Integrated via direct API fetch in `ai-chatbot.js`.
- **Globe.gl**: CDN-linked for high-contrast topology rendering.
