// Add 3 dummy logs to Firebase
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bluesentinel-86ab9-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Dummy logs matching real monitoring scenarios
const dummyLogs = [
  {
    time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 1 hour ago
    type: 'Temperature',
    severity: 'warning',
    location: 'Live Sensor Feed',
    details: 'Temperature reading out of range: 33.2°C - Above optimal range',
    timestamp: Date.now() - 3600000,
    acknowledged: false
  },
  {
    time: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 30 min ago
    type: 'Turbidity',
    severity: 'alert',
    location: 'Live Sensor Feed',
    details: 'Turbidity reading out of range: 8.5 NTU - Water clarity compromised',
    timestamp: Date.now() - 1800000,
    acknowledged: false
  },
  {
    time: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 10 min ago
    type: 'pH',
    severity: 'warning',
    location: 'Live Sensor Feed',
    details: 'pH reading out of range: 8.7 - Slightly alkaline conditions detected',
    timestamp: Date.now() - 600000,
    acknowledged: false
  }
];

// Add logs to Firebase
async function addDummyLogs() {
  try {
    console.log('Adding 3 dummy logs to Firebase...');
    
    for (const log of dummyLogs) {
      await db.ref('logs').push(log);
      console.log(`✅ Added ${log.severity} log for ${log.type}`);
    }
    
    console.log('\n✅ All 3 dummy logs added successfully!');
    console.log('You can view them at: https://console.firebase.google.com/');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding dummy logs:', error);
    process.exit(1);
  }
}

addDummyLogs();
