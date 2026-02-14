# BlueSentinel - Technical Specifications (V2.1)

## 🏗️ System Architecture

### Overview

BlueSentinel implements a **Hybrid AI-IoT Architecture**:

1. **Edge**: ESP32 sensors (Real-time data acquisition).
2. **Cloud**: Firebase Realtime Database (Low-latency sync).
3. **Intelligence**: Google Gemini (Deep analysis) + Local Logic (Immediate alerts).

---

## 🔧 Hardware Specifications

### Primary Controller

- **Microcontroller**: ESP32 Dev Module (Dual-core 240MHz).
- **Network**: WiFi 802.11 b/g/n + Bluetooth 4.2.
- **Power**: Solar-ready 5V input.

### Sensor Array (V2.1)

| Parameter | Sensor Model | Range | Accuracy | Status |
| :--- | :--- | :--- | :--- | :--- |
| Temperature | DS18B20 | -55°C to +125°C | ±0.5°C | ✅ Live |
| pH | Analog pH | 0-14 pH | ±0.1 pH | ✅ Live |
| Turbidity | Analog Optical | 0-3000 NTU | ±5% | ✅ Live |
| Dissolved O₂ | Simulation | 0-20 mg/L | ±0.2 mg/L | ⚠️ Simulated |
| Salinity | Simulation | 0-50 PSU | ±0.1 PSU | ⚠️ Simulated |

---

## 💻 Frontend Architecture (Benthic UI)

### Technology Stack

- **Core**: Vanilla JS (ES6+) for maximum performance.
- **Visuals**:
  - `Globe.gl` (WebGL Earth).
  - `Chart.js` (Canvas Graphing).
  - Canvas API (Particle Backgrounds).
- **Styling**: `Glassmorphism` (CSS Backdrop Filter).

### Performance Optimization

- **Bento Grid**: CSS Grid layout reduces layout thrashing.
- **Debounced Rendering**: Charts update max once per 500ms.
- **Asset Lazy Loading**: 3D Globe textures load only when visible.

---

## 🤖 AI & Machine Learning

### Gemini Integration

- **Model**: Gemini 1.5 Flash.
- **Latency**: <2s for full text analysis.
- **Prompt Engineering**: Context-aware prompts include last 10 sensor readings to detect trends (rising/falling).

### Local "Expert System"

- **Fallback**: If AI is offline, hardcoded thresholds trigger alerts.
  - pH < 6.5 -> "Acidic Warning"
  - Temp > 30°C -> "Thermal Pollution"

---

## 🔒 Security

### Data Security

- **Transport**: HTTPS/WSS (TLS 1.2+).
- **Access Control**:
  - ESP32: Uses API Key (scoped).
  - Users: Anonymous Auth (Demo) / Email Auth (Production).
- **Credentials**: Stored in `secrets.h` (Hardware) & `firebase-init.js` (Web - restricted by domain).

---

## 📊 Deployment

### Hosting

- **Provider**: Firebase Hosting (Global CDN).
- **CI/CD**: Manual deploy via Firebase CLI.

### Scalability

- **Database**: Sharded by `region_id` (planned).
- **Frontend**: Static assets served from edge locations.
