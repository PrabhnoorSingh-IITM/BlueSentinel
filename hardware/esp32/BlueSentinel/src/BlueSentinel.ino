/*******************************************************
 * BlueSentinel IoT Firmware (Final Working Version)
 * Board: ESP32 Dev Module
 * Sensors:
 *   - pH Sensor (Analog)
 *   - DS18B20 Temperature Sensor
 * Cloud: Firebase Realtime Database
 * Author: Prabhnoor Singh
 *******************************************************/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "secrets.h"

/* ===================== PIN DEFINITIONS ================== */
#define PH_PIN         32
#define ONE_WIRE_BUS   4   // DS18B20 DATA
/* ======================================================== */

/* ===================== FIREBASE ========================= */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
/* ======================================================== */

/* ===================== DS18B20 ========================== */
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
/* ======================================================== */

/* ===================== ADC ============================== */
const float ADC_MAX  = 4095.0;
const float ADC_VREF = 3.9;
/* ======================================================== */

/* ===================== pH CALIBRATION =================== */
const float PH7_VOLTAGE = 2.05;   // measured in RO water
const float PH_SLOPE    = 0.18;   // volts per pH
/* ======================================================== */

void setup() {
  Serial.begin(115200);
  delay(1000);

  /* ---------- ADC ---------- */
  analogReadResolution(12);
  analogSetPinAttenuation(PH_PIN, ADC_11db);

  /* ---------- TEMPERATURE ---------- */
  tempSensor.begin();

  /* ---------- WIFI ---------- */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  /* ---------- FIREBASE ---------- */
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous sign-in (REQUIRED)
  if (!Firebase.signUp(&config, &auth, "", "")) {
    Serial.printf("Firebase signup failed: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("BlueSentinel system online");
}

void loop() {

  /* ================= TEMPERATURE ================= */
  tempSensor.requestTemperatures();
  float temperatureC = tempSensor.getTempCByIndex(0);

  /* ================= pH SENSOR ================= */
  int phRaw = analogRead(PH_PIN);
  float phVoltage = phRaw * (ADC_VREF / ADC_MAX);
  float pH = 7.0 + (PH7_VOLTAGE - phVoltage) / PH_SLOPE;

  if (pH < 0) pH = 0;
  if (pH > 14) pH = 14;

  /* ================= SERIAL OUTPUT ================= */
  Serial.println("----- BlueSentinel Readings -----");

  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  Serial.print("pH: ");
  Serial.println(pH, 2);

  /* ================= FIREBASE UPLOAD ================= */
  if (Firebase.ready()) {
    bool ok1 = Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/temperature", temperatureC);
    bool ok2 = Firebase.RTDB.setFloat(&fbdo, "/BlueSentinel/pH", pH);

    if (ok1 && ok2) {
    } else {
      Serial.print("Firebase error: ");
      Serial.println(fbdo.errorReason());
    }
  }

  delay(5000);  // every 5 seconds
}
