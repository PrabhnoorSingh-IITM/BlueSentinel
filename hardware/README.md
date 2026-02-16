# BlueSentinel Hardware (V2.1)

This directory contains all hardware-related files for BlueSentinel's IoT sensor nodes.

## ⚡️ Current Hardware Setup

**Deployed Node:** "Benthic One" (ESP32 Dev Module)

### Active Sensors

| Sensor | Interface | Status | Pin |
| :--- | :--- | :--- | :--- |
| **DS18B20** | OneWire | ✅ Live | GPIO 4 |
| **Analog pH** | Analog | ✅ Live | GPIO 32 |
| **Turbidity** | Analog | ✅ Live | GPIO 35 |
| **Dissolved O₂** | Analog | ⚠️ Simulated | GPIO 34 |
| **Salinity** | Analog | ⚠️ Simulated | GPIO 39 |

*Note: DO and Salinity are currently simulated in firmware until physical sensors arrive.*

---

## 📡 Wiring Diagram

```text
ESP32 Dev Module
┌─────────────────┐
│                 │
│  Pin 4  ────────┼──── DS18B20 (Temp)
│  Pin 32 ────────┼──── pH Sensor
│  Pin 35 ────────┼──── Turbidity Sensor
│  3.3V   ────────┼──── Sensor VCC
│  GND    ────────┼──── Sensor GND
│  USB    ────────┼──── 5V Power
│                 │
└─────────────────┘
```

## 🔋 Power Management

- **Primary**: Solar Panel (6V 5W) + TP4056 Charger + 18650 Li-Ion Cell.
- **Backup**: USB Power Bank for demos.
- **Consumption**: ~180mA (WiFi Active) / ~10µA (Deep Sleep).

## 🔧 Maintenance

1. **pH Probe**: Keep wet in KCI storage solution. Calibrate monthly.
2. **Turbidity**: Wipe optical window weekly to prevent biofouling.

## 📂 Directory Structure

- `esp32/`: Firmware source code for the node.
- `docs/`: Data sheets and calibration guides.
