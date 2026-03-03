<!-- markdownlint-disable MD033 -->
# BlueSentinel - River Intelligence Platform

<div align="center">
  <h3>A Digital Nervous System for Rivers</h3>
  <p><strong>Real-time freshwater monitoring, pollution detection, and AI-driven insights</strong></p>
  <p>
    <a href="https://bluesentinel1.web.app">View Live Dashboard</a>
    ·
    <a href="https://github.com/PrabhnoorSingh-IITM/BlueSentinel/issues">Report Bug</a>
    ·
    <a href="https://github.com/PrabhnoorSingh-IITM/BlueSentinel/pulls">Request Feature</a>
  </p>
</div>

---

## 🌊 Overview

**BlueSentinel** addresses a critical challenge in freshwater conservation: the inability to detect river pollution events in real-time. By the time conventional monitoring identifies a leak or runoff, downstream ecosystems have often suffered irreversible damage. Our platform bridges this gap with continuous sensor monitoring, intelligent analysis, and immediate alerts.

The system combines IoT hardware with cloud infrastructure to provide authorities and researchers with actionable intelligence about river health. We track critical water quality parameters and leverage Gemini LLMs to predict pollution trends and suggest immediate solutions.

---

## 🚀 Key Features (Update)

### 🖥️ Next-Gen Dashboard

- **Bento Grid Layout**: Modular, responsive card system for optimal data density.
- **Mac-Style Dock**: Sleek, icon-only floating navigation with magnification effects.
- **Glassmorphism UI**: Premium " Modern" aesthetic with frosted glass elements and neon accents.
- **Dark Mode Native**: Optimized for low-light monitoring environments.

### 🤖 AI-Powered Intelligence

- **Gemini Integration**: Real-time water health analysis using Google's Gemini models.
- **Hybrid AI Engine**: Context-aware analysis of pH, Turbidity, and Dissolved Oxygen.
- **Smart Remediation**: Suggests chemical and physical treatments for critical sensor readings (e.g., "Add buffering agents for high acidity").

### 🌍 3D Geospatial Visualization

- **Interactive Globe**: Uses `globe.gl` to render a 3D Earth with glowing incident markers.
- **Night-Mode Topology**: Stunning visual representation of log locations (e.g., Toxic algae blooms, pH spikes).

### 📊 Comprehensive Monitoring

- **Real-Time Sensors**: Tracks Temperature, pH, Turbidity, Dissolved Oxygen (DO).
- **Predictive ML**: Integrated machine learning models project future water quality trends.
- **Community Forums**: Submit field reports and collaborate with other researchers.
- **News Aggregator**: Curated river conservation and freshwater monitoring updates from global sources.

---

## 🛠️ Technology Stack

### Hardware & IoT

- **ESP32**: Main controller handling sensor data acquisition.
- **Sensors**: DS18B20 (Temp), Analog pH, Turbidity, DO via ADC.
- **Connectivity**: WiFi-based HTTPS upload to Firebase Realtime Database.

### Frontend (Vanilla Stack)

- **Core**: HTML5, CSS3 (Variables + Flexbox/Grid), ES6 JavaScript.
- **Visuals**:
  - `Globe.gl` (3D Visualization)
  - `Chart.js` (Time-series Graphing)
  - `Bootstrap Icons` & `Unicons`
  - `Canvas API` (Constellation/Particle Backgrounds)

### Backend & Cloud

- **Firebase**:
  - **Realtime Database**: Instant data syncing across devices.
  - **Hosting**: Global CDN delivery.
  - **Cloud Functions**: Serverless logic for alerts.
- **Gemini API**: Generative AI for ecosystem analysis.

---

## 🏗️ System Architecture

BlueSentinel operates as a three-layer system:

1. **Sensor Layer (ESP32)**: Reads physical sensors every 5 seconds, validates data, and uploads to Firebase via HTTPS.
2. **Cloud Layer (Firebase)**: Stores incoming sensor data, manages authentication, and serves the web application.
3. **Presentation Layer (Web Dashboard)**: Subscribes to real-time database changes, renders dynamic graphs, and provides AI-driven insights.

---

## 🏁 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Git

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/PrabhnoorSingh-IITM/BlueSentinel.git
    cd BlueSentinel
    ```

2. **Install dependencies** (primarily for Firebase functions if used)

    ```bash
    npm install
    ```

3. **Serve locally**

    ```bash
    firebase serve
    ```

    Navigate to `http://localhost:5000` to access the dashboard.

### Deployment

```bash
firebase deploy --only hosting
```

---

## 📂 Project Structure

```text
BlueSentinel/
├── public/          # Frontend application
│  ├── css/         # Stylesheets (global, landing, dock, etc.)
│  ├── js/          # JavaScript modules
│  │  ├── core/       # Firebase init
│  │  ├── dashboard.js # Main dashboard logic
│  │  ├── forums.js     # Community forums logic
│  │  ├── logs.js      # Incident logging & Globe
│  │  └──...
│  ├── assets/        # Images and icons
│  ├── dashboard.html    # Main dashboard
│  ├── index.html      # Landing page
│  └──...
├── hardware/         # ESP32 Firmware
├── docs/           # Documentation & Implementation Plans
├── firebase.json       # Firebase configuration
└── README.md         # This file
```

---

## 👥 Team

BlueSentinel is developed by a passionate team of engineers:

- **Prabhnoor Singh** - Lead Developer & Architect
- **Mehak Kaur** - IoT & Hardware Engineer
- **Jaisveen Kaur** - ML & Analytics Engineer
- **Prabhleen Kaur** - Frontend & UX Engineer

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><em>"Real-time visibility, proactive protection, sustainable rivers."</em></p>
  <p><strong>BlueSentinel - Protecting Freshwater Ecosystems</strong></p>
</div>
