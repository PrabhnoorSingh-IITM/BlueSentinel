# BlueSentinel Engineering Architecture

BlueSentinel is a sophisticated, real-time environmental intelligence platform engineered to bridge the gap between low-power IoT sensing and high-level AI analysis. This document outlines the fundamental technical pillars that support our "River Intelligence Grid."

## 🏗️ Technical Philosophy: Serverless & Real-Time

We built BlueSentinel on a **Serverless-First** philosophy. By offloading processing to Firebase Cloud Functions and using a Realtime Database as our primary state engine, we achieve sub-second latency while maintaining a footprint that can scale from a single sensor node to a trans-continental grid.

## 📡 Hardware & Ingestion (The IoT Pulse)

Our data acquisition starts at the river edge. Hardware nodes utilize the **ESP32 microcontroller**, selected for its robust Wi-Fi capabilities and low energy consumption.

- **Sensor Array**: We monitor a four-parameter suite (pH, Turbidity, Temperature, Dissolved Oxygen) using industrial-grade analog and digital probes.
- **Secure Sync**: Telemetry is transmitted via an optimized JSON packet over HTTPS. We utilize the Firebase Database Secret protocol for authentication to ensure that only verified "Sentinels" can write to our grid.
- **Latency Performance**: Typical "Sensor-to-Screen" latency is measured at `<150ms`.

## ☁️ The Intelligence Hub (AI-Driven Insights)

The "Intelligence" in BlueSentinel comes from a multi-tiered analysis engine:

### Adaptive AI Audits (Google Gemini)

Every 15 minutes, a cloud trigger activates our **Gemini 2.0 AI Auditor**. This auditor doesn't just look at single data points; it contextualizes trends. It understands that a sudden pH drop combined with a temperature spike might indicate industrial discharge rather than natural runoff.

### Expert System Fallback

Connectivity is never guaranteed in remote field locations. If the Gemini API is unreachable (e.g., 403/503 errors), the system automatically gracefully degrades to a **Deterministic Expert System**. This system uses hard-coded scientific thresholds to maintain "Safety Status" reporting without needing an LLM.

## 🎨 Professional Frontend Modularity

Our frontend is designed for speed and clarity, adhering to a strict **Industrial Modular Structure**:

- **Separation of Concerns**: Page-specific logic is isolated in `public/js/features/`, while core infrastructure (like Firebase initialization and AI bridging) is in `public/js/core/`.
- **Zero-Inline Policy**: We enforce a 100% externalization rule for CSS and JS. This ensures high-performance rendering and a codebase that is as easy to audit as it is to use.

## 🗺️ GIS & Geospatial Visualization

Visualization is key to understanding toxic spread. We utilize **Globe.gl** to project real-time incident clusters onto a 3D model of the Earth, providing environmental stakeholders with immediate geospatial context.

---
**BlueSentinel Engineering | 2026**
