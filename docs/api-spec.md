# API Specification (V2.1)

## Overview

BlueSentinel relies primarily on **Firebase Realtime Database** for data sync and **Gemini API** for intelligence.

---

## 1. Firebase Realtime Database

### `BlueSentinel/sensors/latest`

Read-only for clients. Written by ESP32.

```json
{
  "temperature": 24.5,
  "pH": 7.8,
  "turbidity": 2.3,
  "dissolvedOxygen": 8.5,
  "timestamp": 1738454400000
}
```

### `incidents/{incidentId}`

Logged events for the 3D Globe.

```json
{
  "type": "Critical",
  "location": { "lat": 12.97, "lng": 77.59 },
  "message": "pH drop detected",
  "timestamp": 1738454400000
}
```

### `forum_posts/{postId}`

Community field reports.

```json
{
  "author": "Dr. Singh",
  "title": "Algal Bloom in Sector 7",
  "content": "Observed green discoloration...",
  "timestamp": 1738454400000
}
```

---

## 2. Gemini AI Integration (Client-Side)

### Prompt Structure

We construct prompts dynamically in `ai-chatbot.js`:

**Input**:
> "You are SentinelBuddy, an ocean expert. Current readings: pH 5.2, Temp 30C. Warning: Acidity. Advise."

**Expected Output**:
> "Critical Alert: pH 5.2 is lethal for most fish. Immediate liming (adding CaO) is required to neutralize acidity. Check industrial runoff upstream."

---

## 3. Hardware API (ESP32)

### Upload Endpoint

`POST https://<project-id>.firebaseio.com/BlueSentinel.json?auth=<API_KEY>`

- **Payload**: JSON object with sensor readings.
- **Response**: `200 OK` { "name": "-Mz..." }
