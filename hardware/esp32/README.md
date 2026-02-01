# BlueSentinel ESP32 Firmware Guide

## Quick Start

### 1. Hardware Setup
- **Microcontroller:** ESP32 DevKit
- **Sensors:**
  - Temperature: DS18B20 or LM35 (Analog pin 34)
  - pH: Analog pH sensor (Analog pin 35)
  - Turbidity: Turbidity sensor (Analog pin 36)
  - Dissolved Oxygen: Analog DO sensor (Analog pin 39)

### 2. Software Requirements
- PlatformIO IDE or Arduino IDE
- Libraries:
  - `ESP32` board support
  - `Firebase ESP32` by Mobizt
  - OneWire (for temperature sensors)
  - DallasTemperature (optional)

### 3. Installation Steps

#### Option A: Using PlatformIO (Recommended)

1. **Install PlatformIO:**
   - Install VS Code + PlatformIO extension

2. **Create Project:**
   ```bash
   cd hardware/esp32/BlueSentinel
   ```

3. **Configure credentials in `src/secrets.h`:**
   ```cpp
   #define WIFI_SSID "YOUR_WIFI_SSID"
   #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
   #define FIREBASE_API_KEY "YOUR_API_KEY"
   #define FIREBASE_DATABASE_URL "https://YOUR_PROJECT.firebaseio.com"
   ```

4. **Compile and Upload:**
   ```bash
   pio run -t upload
   ```

#### Option B: Using Arduino IDE

1. **Open Arduino IDE**

2. **Install Libraries:**
   - Sketch → Include Library → Manage Libraries
   - Search for "Firebase ESP32"
   - Install by Mobizt

3. **Open Firmware:**
   - File → Open → `BlueSentinel.ino`

4. **Configure Board:**
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → Select your ESP32 port

5. **Upload:**
   - Upload button (→)

### 4. Get Firebase Credentials

#### Firebase API Key:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. **Project Settings** (gear icon) → **General**
4. Copy "Web API Key"

#### Database URL:
1. **Realtime Database** section
2. Look at the URL bar (format: `https://YOUR_PROJECT_ID.firebaseio.com`)

#### Enable Anonymous Auth (Optional):
1. **Authentication** → **Sign-in method**
2. Enable **Anonymous**

### 5. Update Database Rules

Edit `database.rules.json` in your project root:

```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true,
      "latest": {
        ".indexOn": ["timestamp"]
      },
      "history": {
        ".indexOn": ["timestamp"]
      }
    }
  }
}
```

Deploy with:
```bash
firebase deploy --only database
```

### 6. Monitor ESP32

Open Serial Monitor in Arduino IDE:
- Tools → Serial Monitor
- Baud Rate: **115200**
- You should see:
  ```
  === BlueSentinel ESP32 Starting ===
  Connecting to WiFi: YOUR_SSID
  WiFi connected!
  IP Address: 192.168.x.x
  Initializing Firebase...
  Firebase initialized!
  ✓ Latest data uploaded to Firebase
  ✓ Historical data pushed to Firebase
  ```

---

## Sensor Configuration & Calibration

### Temperature Sensor (LM35)
- **Pin:** 34 (ADC0)
- **Voltage:** 10mV per °C
- **Range:** -10°C to 50°C
- **Calibration:** Adjust `TEMP_CALIBRATION_OFFSET` in `config.h`

### pH Sensor
- **Pin:** 35 (ADC1)
- **Range:** 0-14 pH
- **Calibration Required:** Two-point calibration
  - Edit `PH_7_ADC`, `PH_4_ADC`, `PH_10_ADC` values in `config.h`
  - Calibrate in pH 7, pH 4, and pH 10 buffer solutions

### Turbidity Sensor
- **Pin:** 36 (ADC2)
- **Range:** 0-5000 NTU (Nephelometric Turbidity Units)
- **Note:** Higher ADC = Lower turbidity (clearer water)

### Dissolved Oxygen Sensor
- **Pin:** 39 (ADC3)
- **Range:** 0-20 mg/L
- **Calibration:** Requires calibration in known oxygen solutions

---

## Firebase Data Format

### Latest Reading (`sensors/latest`)
```json
{
  "temperature": 25.5,
  "ph": 7.2,
  "turbidity": 5.3,
  "dissolvedOxygen": 8.5,
  "timestamp": 1738454400000,
  "deviceId": "ESP32-001"
}
```

### Historical Data (`sensors/history`)
```json
{
  "-N1234567890": {
    "temperature": 25.0,
    "ph": 7.1,
    "turbidity": 5.0,
    "dissolvedOxygen": 8.3,
    "timestamp": 1738454300000,
    "deviceId": "ESP32-001"
  }
}
```

---

## Troubleshooting

### WiFi Connection Issues
- Check SSID and password in `secrets.h`
- Ensure ESP32 is within WiFi range
- Restart ESP32

### Firebase Connection Issues
- Verify API key and database URL
- Check database rules allow `sensors` path
- Enable Anonymous Authentication in Firebase Console

### Sensor Not Reading Values
- Check sensor wiring to correct pins
- Verify power supply (3.3V for sensors)
- Check ADC values in Serial Monitor
- Calibrate sensor if needed

### Data Not Appearing on Dashboard
1. Check Firebase rules
2. Verify `sensors/latest` path exists
3. Look for errors in Serial Monitor
4. Test with simulated data (see dashboard.js)

---

## Advanced: Custom Sensor Wiring

If using different pins, edit in `BlueSentinel.ino`:

```cpp
#define TEMP_SENSOR_PIN 34      // Change if needed
#define PH_SENSOR_PIN 35
#define TURBIDITY_SENSOR_PIN 36
#define DO_SENSOR_PIN 39
```

Also update the conversion functions for your specific sensor types.

---

## Upload Frequency Control

Edit `config.h`:
```cpp
#define UPLOAD_INTERVAL_MS 5000  // Upload every 5 seconds
```

- Lower = More frequent updates (uses more bandwidth/power)
- Higher = Less frequent updates (saves power)

---

## Battery/Power Optimization

For battery-powered ESP32:
1. Increase `UPLOAD_INTERVAL_MS` to 30000ms (30 sec)
2. Use ESP32 deep sleep mode between readings
3. Add battery level monitoring

---

## File Structure Reference

```
src/
├── BlueSentinel.ino      # Main firmware entry point
├── config.h              # Configuration constants
├── secrets.h             # WiFi & Firebase credentials
└── [future: sensors.cpp, firebase.cpp, utils.cpp]
```

---

## Support & Documentation

- [Firebase ESP32 Library Docs](https://github.com/mobizt/Firebase-ESP32)
- [ESP32 Pin Reference](https://randomnerdtutorials.com/esp32-pinout-reference-which-gpio-pins-are-safe-to-use/)
- [Arduino IDE Guide](https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-getting-started)
