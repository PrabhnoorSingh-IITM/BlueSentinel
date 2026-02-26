/*******************************************************
 * BlueSentinel IoT Firmware (Final Version)
 * Board: ESP32 Dev Module
 * Sensors:
 *   - pH Sensor (Analog)
 *   - DS18B20 Temperature Sensor
 *   - Turbidity Sensor (Analog)
 * Cloud: Firebase Realtime Database
 * Author: Prabhnoor Singh
 *******************************************************/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <OneWire.h>
#include <DallasTemperature.h>

/* ===================== Credentials ===================== */
#define WIFI_SSID       "Redmi 13 5G"
#define WIFI_PASSWORD   "0124578369"

#define API_KEY         "AIzaSyC-ZSHCwC4yAPeksv5gleDClypMvd93_yo"
#define DATABASE_URL    "https://bluesentinel1-default-rtdb.asia-southeast1.firebasedatabase.app/"

/* ================= PINS ================= */
#define PH_PIN          32
#define TURBIDITY_PIN   35
#define ONE_WIRE_BUS    4

/* ================= FIREBASE OBJECTS ================= */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* ================= TEMP SENSOR ================= */
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

/* ================= ADC CONFIG ================= */
const float ADC_MAX  = 4095.0;
const float ADC_VREF = 3.9;

/* ================= pH CALIBRATION ================= */
const float PH7_VOLTAGE = 2.05;
const float PH_SLOPE    = 0.18;

/* ================= ANALOG AVERAGING ================= */
float readAverage(int pin, int samples = 10) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(5);
  }
  return sum / (float)samples;
}

/* ==================================================== */

void setup() {

  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== Riventhra System Boot ===");

  analogReadResolution(12);
  analogSetPinAttenuation(PH_PIN, ADC_11db);
  analogSetPinAttenuation(TURBIDITY_PIN, ADC_11db);

  tempSensor.begin();

  /* ---------- WiFi ---------- */
  Serial.print("Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  /* ---------- Firebase ---------- */
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Serial.println("Initializing Firebase...");

  if (!Firebase.signUp(&config, &auth, "", "")) {
    Serial.print("Signup failed: ");
    Serial.println(config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("System ready\n");
}

/* ==================================================== */

void loop() {

  Serial.println("===== SENSOR UPDATE =====");

  /* ---------- Temperature ---------- */
  tempSensor.requestTemperatures();
  float temperatureC = tempSensor.getTempCByIndex(0);

  if (temperatureC == DEVICE_DISCONNECTED_C) {
    Serial.println("Temp sensor error!");
    temperatureC = -1;
  }

  /* ---------- pH ---------- */
  float phRaw = readAverage(PH_PIN);
  float phVoltage = phRaw * (ADC_VREF / ADC_MAX);

  float pH = 7.0 + (PH7_VOLTAGE - phVoltage) / PH_SLOPE;
  pH = constrain(pH, 0, 14);

/* ---------- Turbidity ---------- */
  float turbRaw = readAverage(TURBIDITY_PIN);
  float turbVoltage = turbRaw * (ADC_VREF / ADC_MAX);

  // If the 5V sensor is passed through a voltage divider to the 3.3V ESP32,
  // clear water (4.2V natively) appears as ~2.8V on the ADC.
  // We align the measured voltage back to the 5V scale for the standard curve.
  float sensorVoltage = turbVoltage * (5.0 / 3.3); 

  // Stable turbidity mapping
  float turbidityNTU;

  if (sensorVoltage < 2.5) {
    turbidityNTU = 3000;         // very dirty
  }
  else if (sensorVoltage >= 4.2) {
    turbidityNTU = 0;            // clear / air
  }
  else {
    // Standard SEN0189 / DFRobot nonlinear curve
    turbidityNTU = -1120.4 * (sensorVoltage * sensorVoltage) + 5742.3 * sensorVoltage - 4353.8;
  }

  // Clamp values realistically as per hardware limits
  if (turbidityNTU < 0) turbidityNTU = 0;
  if (turbidityNTU > 1000) turbidityNTU = 1000;


  /* ---------- Serial Output ---------- */
  Serial.print("Temp: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  Serial.print("pH: ");
  Serial.println(pH, 2);

  Serial.print("Turbidity: ");
  Serial.print(turbidityNTU, 1);
  Serial.println(" NTU");

  /* ---------- Firebase Upload ---------- */
  if (Firebase.ready()) {

    Serial.println("Uploading to Firebase...");

    bool tOK = Firebase.RTDB.setFloat(
        &fbdo, "/BlueSentinel/temperature", temperatureC);

    bool pHOK = Firebase.RTDB.setFloat(
        &fbdo, "/BlueSentinel/pH", pH);

    bool turbOK = Firebase.RTDB.setFloat(
        &fbdo, "/BlueSentinel/turbidity", turbidityNTU);

    if (tOK && pHOK && turbOK) {
      Serial.println("Firebase upload SUCCESS");
    } else {
      Serial.println("Firebase upload FAILED:");
      Serial.println(fbdo.errorReason());
    }

  } else {
    Serial.println("Firebase not ready");
  }

  Serial.println("=========================\n");

  delay(5000);
}
