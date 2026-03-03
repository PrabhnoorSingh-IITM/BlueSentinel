# BlueSentinel - Viva Voce Preparation (V2.1)

## 🎯 Core Concepts

### Q1: What is "V2.1 BlueSentinel Edition"?

**Answer:** It's our major UI/UX and AI overhaul.

- **BlueSentinel**: Refers to the lowest level of a body of water (deep ocean).
- **Features**: Glassmorphic "Dark Mode" UI, 3D Globe, and Gemini AI integration.

### Q2: Why did you choose Firebase?

**Answer:** Speed. Environmental monitoring requires *real-time* awareness. Firebase Realtime Database pushes updates via WebSockets (<100ms), whereas a REST API would require polling (slower, more bandwidth).

---

## 🤖 AI & Intelligence

### Q3: How does the AI integration work?

**Answer:** We send a prompt to **Google Gemini** containing the current sensor vector (e.g., pH 7.2, Temp 24C). The AI acts as a "Virtual Marine Biologist," interpreting the data and suggesting remediation (e.g., "Add crushed limestone to buffer acidity").

### Q4: What if the AI fails?

**Answer:** We have a **Hybrid System**. A local JavaScript "Expert System" checks hardcoded thresholds (e.g., pH < 6.0) to generate immediate "Critical" alerts even if the AI API is down.

---

## 🌍 Visualization

### Q5: Why use a 3D Globe?

**Answer:** Ocean pollution is a global problem. A 2D map doesn't convey the interconnectedness of ocean currents. `Globe.gl` allows us to visualize data clusters and "Dark Side" incidents effectively.

### Q6: How is the Dashboard optimized?

**Answer:**

- **Bento Grids**: Modular layout for responsiveness.
- **Canvas Rendering**: We use Canvas for charts and background effects (particles) to offload work to the GPU.

---

## 🔧 IoT & Hardware

### Q7: How do you handle sensor noise?

**Answer:** We use a simple **Moving Average** filter on the ESP32 before sending data to smooth out spikes.

### Q8: What happens if WiFi is lost?

**Answer:** The ESP32 enters a deep-sleep retry loop. On the dashboard side, simulation mode can kick in for demos, or the "Last Updated" timestamp turns red to indicate stale data.
