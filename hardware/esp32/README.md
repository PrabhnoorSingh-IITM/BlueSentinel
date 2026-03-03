# BlueSentinel Firmware (V2.1)

Firmware for the ESP32-based environmental monitoring node. All credentials are securely stored in `secrets.h`.

## 🚀 Quick Start

### 1. Prerequisites

- **VS Code** with **PlatformIO** extension (Recommended).
- OR **Arduino IDE** with `ESP32 Board Manager` and `Firebase-ESP-Client` library.

### 2. Configuration

Create a `src/secrets.h` file (not committed) with your credentials:

```cpp
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASSWORD "YOUR_PASS"
#define FIREBASE_API_KEY "YOUR_API_KEY"
#define FIREBASE_DATABASE_URL "https://your-project.firebaseio.com"
#define USER_EMAIL "user@example.com"
#define USER_PASSWORD "secret"
```

### 3. Flash Firmware

1. Connect ESP32 via USB.
2. Run `pio run -t upload` (or Upload button in Arduino).
3. Monitor Serial Output at **115200 baud**.

---

## 📡 Data Protocol

The node sends a JSON payload every **5 seconds** to:
`BlueSentinel/sensors/latest`

```json
{
  "temperature": 23.5,
  "pH": 7.1,
  "turbidity": 12.0,
  "dissolvedOxygen": 8.5,
  "timestamp": 1234567890000
}
```

## ✨ Features

- **Smart Reconnect**: Auto-reconnects to WiFi/Firebase if connection drops.
- **Smoothing**: Applies a 10-sample moving average to stabilize noisey analog readings.
- **Simulation Fallback**: If sensors are disconnected, optional flags in code can enable dummy data generation for demos.

## 🛠 Calibration

Adjust the calibration factors in `config.h`:

- `PH_OFFSET`: Shift pH curve.
- `TURBIDITY_FACTOR`: Convert voltage to NTU.
