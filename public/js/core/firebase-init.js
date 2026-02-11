// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyC-ZSHCwC4yAPeksv5gleDClypMvd93_yo",
  authDomain: "bluesentinel1.firebaseapp.com",
  databaseURL: "https://bluesentinel1-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "bluesentinel1",
  storageBucket: "bluesentinel1.appspot.com",
  messagingSenderId: "844615264671",
  appId: "1:844615264671:web:bdc4ef8d6ce7ec2c3c75aa",
  measurementId: "G-1KCEZJL6JT"
};

// Initialize Firebase
let app, database;

try {
  app = firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export for use in other modules
window.firebaseApp = app;
window.firebaseDB = database;
