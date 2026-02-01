/*
 * Configuration for BlueSentinel ESP32
 * Hardware settings and constants
 */

#ifndef CONFIG_H
#define CONFIG_H

// Device identification
#define DEVICE_ID "ESP32-001"
#define DEVICE_NAME "BlueSentinel Water Monitor"

// Sensor sampling settings
#define SAMPLE_COUNT 5              // Number of samples to average
#define SAMPLE_DELAY_MS 100         // Delay between samples
#define UPLOAD_INTERVAL_MS 5000     // Upload to Firebase every 5 seconds

// Temperature sensor calibration
#define TEMP_CALIBRATION_OFFSET 0.0 // Offset for calibration (°C)
#define TEMP_CALIBRATION_SCALE 1.0  // Scale factor for calibration

// pH sensor calibration points (2-point calibration)
#define PH_7_ADC 2048               // ADC value at pH 7 (neutral)
#define PH_4_ADC 2900               // ADC value at pH 4 (acidic)
#define PH_10_ADC 1200              // ADC value at pH 10 (basic)

// Turbidity sensor calibration
#define TURBIDITY_CALIBRATION_OFFSET 0.0
#define TURBIDITY_CALIBRATION_SCALE 1.0

// Dissolved Oxygen sensor calibration
#define DO_CALIBRATION_OFFSET 0.0
#define DO_CALIBRATION_SCALE 1.0

// WiFi settings (load from secrets.h)
// #define WIFI_SSID
// #define WIFI_PASSWORD

// Firebase settings (load from secrets.h)
// #define FIREBASE_API_KEY
// #define FIREBASE_DATABASE_URL
// #define FIREBASE_EMAIL
// #define FIREBASE_PASSWORD

// Alert thresholds
#define TEMP_ALERT_MIN 5.0          // Alert if below 5°C
#define TEMP_ALERT_MAX 45.0         // Alert if above 45°C
#define PH_ALERT_MIN 6.5            // Alert if below 6.5
#define PH_ALERT_MAX 8.5            // Alert if above 8.5
#define TURBIDITY_ALERT_MAX 10.0    // Alert if above 10 NTU
#define DO_ALERT_MIN 4.0            // Alert if below 4 mg/L

// LED pins for status indicators
#define STATUS_LED_PIN 2            // General status
#define WIFI_LED_PIN 15             // WiFi connection
#define FIREBASE_LED_PIN 4          // Firebase connection

// Debug settings
#define DEBUG_MODE true             // Enable serial debugging
#define SERIAL_BAUD_RATE 115200

#if DEBUG_MODE
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

#endif // CONFIG_H
