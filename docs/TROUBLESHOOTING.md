# 🔧 Dashboard Live Data Troubleshooting Guide

## Problem: Dashboard not showing live data or graph

### ✅ Fixes Applied

1. **Added databaseURL to Firebase config**
   - File: `public/js/core/firebase-init.js`
   - Added: `databaseURL: "https://bluesentinel1-default-rtdb.firebaseio.com"`

2. **Updated Database Rules**
   - File: `database.rules.json`
   - Added read/write access for `/BlueSentinel` and `/logs` paths
   - Deployed to Firebase ✅

3. **Enhanced Debugging**
   - Added detailed console logging in dashboard.js
   - Added test data writer if no data exists
   - Added success/error notifications

4. **Created Test Tools**
   - `test-firebase.html` - Firebase connection tester
   - `add-dummy-logs.html` - Log data generator

---

## 🚀 Step-by-Step Testing

### Step 1: Test Firebase Connection
1. Open: `http://localhost:5000/test-firebase.html`
2. Click "1. Test Connection" - Should show ✅ Connected
3. Click "2. Write Test Sensor Data" - Adds sample data
4. Click "3. Read Sensor Data" - Verifies data was written
5. Click "4. Start Live Stream" - Shows real-time updates

### Step 2: Check Dashboard
1. Open: `http://localhost:5000/dashboard.html`
2. Open browser DevTools (F12) → Console tab
3. Look for these messages:
   - ✅ "Firebase initialized successfully"
   - ✅ "Firebase database initialized"
   - ✅ "Chart initialized successfully"
   - 📡 "Firebase data received: {...}"

### Step 3: Add Test Data (if needed)
If console shows "No data found at /BlueSentinel":
1. Go to test-firebase.html
2. Click "Write Test Sensor Data" multiple times
3. Refresh dashboard.html
4. Data should appear in cards and graph

### Step 4: Verify ESP32 Connection
If using real ESP32 hardware:
1. Check ESP32 serial monitor for upload confirmations
2. Verify WiFi connection
3. Confirm Firebase path is `/BlueSentinel`
4. Check that data format matches:
```json
{
  "temperature": 25.5,
  "pH": 7.2,
  "turbidity": 850,
  "timestamp": 1738800000000
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase SDK not loaded"
**Solution:** Check internet connection, Firebase CDN might be blocked
- Verify these scripts load in Network tab:
  - firebase-app-compat.js
  - firebase-database-compat.js

### Issue 2: "Permission denied" errors
**Solution:** Database rules not deployed
```bash
firebase deploy --only database
```

### Issue 3: Cards show "--"
**Causes:**
- No data in Firebase at `/BlueSentinel` path
- Data format incorrect
- Firebase not initialized

**Solution:**
1. Run test-firebase.html to add data
2. Check console for errors
3. Verify data path in Firebase Console

### Issue 4: Graph not updating
**Causes:**
- Chart.js not loaded
- Data not being added to chartData arrays
- Canvas element not found

**Solution:**
1. Check console for "Chart initialized successfully"
2. Verify sensor data has valid numeric values
3. Check that temperature/pH/turbidity are not null

### Issue 5: DO and Salinity show "--"
**Expected behavior:** These are simulated and should show values immediately
- DO: 6.5 - 9.5 mg/L
- Salinity: 32 - 38 PSU
- Updates every 5 seconds

**If not working:**
- Check console for "Simulation started for DO and Salinity"
- Verify no JavaScript errors

---

## 📊 Expected Console Output

When dashboard loads correctly, you should see:
```
DOM elements cached
Firebase initialized successfully
Firebase database initialized
Chart initialized successfully
Setting up Firebase listener on /BlueSentinel path...
✅ Firebase data found at /BlueSentinel
Data: {temperature: 25.5, pH: 7.2, turbidity: 850, ...}
Simulation started for DO and Salinity
Simulated DO: 7.50 Salinity: 35.00
📡 Firebase data received: {...}
✅ Processing sensor data...
📊 Normalized data: {...}
Cards updated at: 02:45:30 PM
Graph point added: 02:45:30 PM Data points: 1
```

---

## 🔍 Firebase Console Verification

1. Go to: https://console.firebase.google.com/project/bluesentinel1/database
2. Navigate to Realtime Database
3. Check that these paths exist:
   - `/BlueSentinel` - Current sensor readings
   - `/logs` - Incident logs
4. Click on `/BlueSentinel` to verify data structure

---

## 🎯 Quick Fix Checklist

- [ ] Database rules deployed (`firebase deploy --only database`)
- [ ] Firebase config has `databaseURL`
- [ ] Test page shows connection successful
- [ ] Test data written to `/BlueSentinel`
- [ ] Dashboard console shows no errors
- [ ] DO and Salinity cards show simulated values
- [ ] Temperature/pH/Turbidity update from Firebase
- [ ] Graph displays data points
- [ ] Active Alerts count shows number
- [ ] Recent Activity lists log entries

---

## 🆘 Still Not Working?

1. **Clear browser cache:** Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard refresh:** Ctrl+F5 (or Cmd+Shift+R on Mac)
3. **Check Firebase status:** https://status.firebase.google.com/
4. **Verify project ID:** Should be `bluesentinel1`
5. **Check database URL:** `https://bluesentinel1-default-rtdb.firebaseio.com`

---

## 📱 Testing URLs

- Firebase Test: http://localhost:5000/test-firebase.html
- Add Logs: http://localhost:5000/add-dummy-logs.html
- Dashboard: http://localhost:5000/dashboard.html
- Logs Page: http://localhost:5000/logs.html

Start Firebase hosting:
```bash
firebase serve
# or
firebase emulators:start --only hosting
```
