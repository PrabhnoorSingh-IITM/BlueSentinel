# BlueSentinel Workflow

This doc explains how the system actually works from sensor to alert.

## 1. Data Collection (Hardware → Cloud)

The ESP32 sits in the water collecting readings every 5 seconds:
- Temperature sensor (DS18B20) measures water temp
- pH sensor measures acidity levels
- Data gets pushed to Firebase Realtime Database at `/BlueSentinel/temperature` and `/BlueSentinel/pH`

We're also simulating turbidity, dissolved oxygen, and salinity on the frontend for now. Eventually these will be real sensors too.

## 2. Real-time Dashboard

The dashboard listens to Firebase and updates live:
- 5 sensor cards show current values
- Live graph plots last 30 data points
- Updates happen instantly when new sensor data arrives
- Uses Chart.js for visualization with multiple y-axes

## 3. Data Processing

Right now the system is pretty straightforward:
- ESP32 reads sensors → Firebase
- Dashboard reads Firebase → Charts
- All processing happens client-side in JavaScript

Next steps:
- Add Firebase Cloud Functions to analyze data server-side
- Calculate health scores based on thresholds
- Detect anomalies (sudden pH drops, temp spikes, etc.)

## 4. Alerts & Notifications

Planned but not implemented yet:
- Twilio SMS alerts when thresholds are breached
- Email notifications for critical incidents
- Push notifications to mobile app

## 5. Historical Analysis

All sensor data gets stored in Firebase so we can:
- View historical trends
- Export data as CSV
- Train ML models on past data
- Predict future conditions

## Development Workflow

1. **Hardware Testing**: Upload new firmware to ESP32, check Serial Monitor for readings
2. **Firebase Check**: Open Firebase Console to verify data is uploading
3. **Frontend Testing**: Open dashboard, check browser console for errors
4. **Live Testing**: Watch the graph update in real-time

## Common Issues

- **No data showing up**: Check Firebase rules, make sure ESP32 is connected to WiFi
- **Graph not updating**: Check browser console for JavaScript errors
- **Wrong pH readings**: Calibrate sensor in pH 7.0 buffer solution
- **Temperature showing -127°C**: DS18B20 not connected properly

## Future Improvements

- Add user authentication
- Multiple device support (right now it's just one ESP32)
- Mobile app with React Native
- Predictive analytics with ML
- Integration with government marine monitoring systems