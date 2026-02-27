// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyDVX49VBeN3MZ5CvrrjJcFe8LrmrTJlUgg",
  authDomain: "gen-lang-client-0986945251.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0986945251-default-rtdb.firebaseio.com/",
  projectId: "gen-lang-client-0986945251",
  storageBucket: "gen-lang-client-0986945251.appspot.com",
  messagingSenderId: "708377878258",
  appId: "1:708377878258:web:7233869279a6d895fa8b36"
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
