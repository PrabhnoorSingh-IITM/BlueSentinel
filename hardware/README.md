# BlueSentinel Hardware

This directory contains all hardware-related files for BlueSentinel's IoT sensor systems.

## Current Hardware

### ESP32 Setup
Located in `esp32/BlueSentinel/`

**Active Sensors:**
- DS18B20 waterproof temperature sensor
- Analog pH sensor with probe

**Status:** ✅ Deployed and uploading data every 5 seconds

See [esp32/README.md](esp32/README.md) for complete firmware documentation.

## Sensor Specifications

### Temperature Sensor (DS18B20)
- **Type:** Digital temperature sensor
- **Range:** -55°C to +125°C
- **Accuracy:** ±0.5°C
- **Interface:** OneWire (Pin 4)
- **Waterproof:** Yes
- **Status:** ✅ Working

### pH Sensor
- **Type:** Analog pH probe
- **Range:** 0-14 pH
- **Accuracy:** ±0.1 pH
- **Interface:** Analog (Pin 32)
- **Calibration:** Requires pH 7.0 buffer solution
- **Status:** ✅ Working

### Planned Sensors

#### Turbidity Sensor
- **Range:** 0-1000 NTU
- **Interface:** Analog
- **Status:** 🔴 Not yet added

#### Dissolved Oxygen Sensor
- **Range:** 0-20 mg/L
- **Interface:** Analog or I2C
- **Status:** 🔴 Not yet added

#### Salinity/Conductivity Sensor
- **Range:** 0-50 PSU
- **Interface:** Analog or I2C
- **Status:** 🔴 Not yet added

## Wiring Diagram

```
ESP32 Dev Module
┌─────────────────┐
│                 │
│  Pin 4  ────────┼──── DS18B20 (DATA)
│  Pin 32 ────────┼──── pH Sensor (Analog)
│  3.3V   ────────┼──── Sensor Power
│  GND    ────────┼──── Ground
│  USB    ────────┼──── Power Supply
│                 │
└─────────────────┘
```

## Power Requirements

- **Voltage:** 5V via USB or 3.7V LiPo battery
- **Current:** ~200mA average (ESP32 + sensors)
- **Battery Life:** ~10 hours with 2000mAh battery

## Deployment Setup

### Waterproof Enclosure
- Use IP67 or IP68 rated enclosure
- Cable glands for sensor wires
- Dessicant packet inside
- Mounting bracket for pole/buoy attachment

### Power Options
1. **USB Power:** For dock/pier deployment
2. **Solar Panel + Battery:** For remote buoys
3. **Hardwired:** For permanent installations

## Calibration

### pH Sensor Calibration
1. Get pH 7.0 buffer solution
2. Submerge probe for 1 minute
3. Read voltage on Serial Monitor
4. Update `PH7_VOLTAGE` in firmware
5. Test with pH 4.0 and 10.0 to verify slope

### Temperature Sensor
DS18B20 comes pre-calibrated, no calibration needed.

## Troubleshooting

### Temperature shows -127°C
- Check OneWire connection
- Verify DS18B20 is powered
- Check if sensor is damaged

### pH readings unstable
- Clean probe with distilled water
- Check if probe needs storage solution
- Verify analog pin connection
- Calibrate sensor

### WiFi not connecting
- Check SSID and password
- Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength
- Restart ESP32

### Data not appearing in Firebase
- Check Firebase credentials
- Verify database rules allow writes
- Check Serial Monitor for errors
- Confirm internet connection

## Adding New Sensors

To add a new sensor:

1. **Update wiring** - Connect to available GPIO pin
2. **Update firmware** - Add sensor reading code
3. **Update Firebase path** - Add new field to upload
4. **Update dashboard** - Add card and graph line
5. **Test thoroughly** - Verify readings are accurate

## Bill of Materials (BOM)

| Component | Qty | Cost (USD) | Link |
|-----------|-----|------------|------|
| ESP32 Dev Module | 1 | $6 | [Link] |
| DS18B20 Sensor | 1 | $3 | [Link] |
| pH Sensor Kit | 1 | $25 | [Link] |
| Jumper Wires | 10 | $2 | [Link] |
| Breadboard | 1 | $3 | [Link] |
| USB Cable | 1 | $2 | [Link] |
| **Total** | - | **$41** | - |

*Prices are approximate and may vary*

## Contributing

To contribute hardware improvements:
1. Document your sensor integration
2. Update wiring diagrams
3. Test in real water conditions
4. Submit PR with photos/videos

## Safety Notes

⚠️ **Important Safety Information:**
- Never power ESP32 underwater
- Keep electronics in waterproof enclosure
- Only sensor probes should touch water
- Use proper fuses for battery power
- Don't deploy in areas with strong currents without proper securing
- Always test in controlled environment first

## Resources

- [ESP32 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)
- [DS18B20 Datasheet](https://datasheets.maximintegrated.com/en/ds/DS18B20.pdf)
- [Firebase ESP32 Library](https://github.com/mobizt/Firebase-ESP-Client)
- [OneWire Library](https://github.com/PaulStoffregen/OneWire)
