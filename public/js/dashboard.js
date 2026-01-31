// Dashboard - Live Sensor Data from Firebase Realtime Database

// Chart variables
let sensorChart = null;
const maxDataPoints = 20; // Keep last 20 readings
const chartData = {
  labels: [],
  temperature: [],
  ph: [],
  turbidity: [],
  dissolvedOxygen: []
};

// Wait for Firebase to initialize
window.addEventListener('load', function() {
  // Check if Firebase is initialized
  if (typeof firebase === 'undefined' || !window.firebaseDB) {
    console.error('Firebase not initialized. Please check firebase-init.js');
    return;
  }

  initializeChart();
  initializeDashboard();
});

function initializeChart() {
  const ctx = document.getElementById('sensor-chart');
  if (!ctx) {
    console.error('Chart canvas not found');
    return;
  }

  sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: chartData.temperature,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'pH',
          data: chartData.ph,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Turbidity (NTU)',
          data: chartData.turbidity,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y2'
        },
        {
          label: 'Dissolved O₂ (mg/L)',
          data: chartData.dissolvedOxygen,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          yAxisID: 'y3'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)',
            color: 'rgb(239, 68, 68)'
          },
          ticks: {
            color: 'rgb(239, 68, 68)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'pH',
            color: 'rgb(34, 197, 94)'
          },
          ticks: {
            color: 'rgb(34, 197, 94)'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
        },
        y3: {
          type: 'linear',
          display: false,
          position: 'right',
        }
      }
    }
  });
}

function initializeDashboard() {
  const db = window.firebaseDB;
  
  // Reference to sensor data in Firebase
  // Adjust these paths based on your Firebase database structure
  const sensorRef = db.ref('sensors/latest'); // Latest single reading
  const historyRef = db.ref('sensors/history').limitToLast(maxDataPoints); // Historical data for graph
  
  // Listen for latest sensor data (for cards display)
  sensorRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      updateSensorDisplay(data);
    } else {
      console.log('No sensor data available');
    }
  }, (error) => {
    console.error('Error reading sensor data:', error);
  });
  
  // Listen for historical data (for graph)
  historyRef.on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (data && sensorChart) {
      addDataPointToChart(data);
    }
  });
  
  // Also update graph when latest data changes
  sensorRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && sensorChart) {
      addDataPointToChart(data);
    }
  });
}

function updateSensorDisplay(data) {
  // Update Water Temperature
  const tempValue = document.getElementById('temp-value');
  if (tempValue && data.temperature !== undefined) {
    tempValue.textContent = parseFloat(data.temperature).toFixed(1);
  }
  
  // Update pH
  const phValue = document.getElementById('ph-value');
  if (phValue && data.ph !== undefined) {
    phValue.textContent = parseFloat(data.ph).toFixed(2);
  }
  
  // Update Turbidity
  const turbidityValue = document.getElementById('turbidity-value');
  if (turbidityValue && data.turbidity !== undefined) {
    turbidityValue.textContent = parseFloat(data.turbidity).toFixed(1);
  }
  
  // Update Dissolved O2
  const doValue = document.getElementById('do-value');
  if (doValue && data.dissolvedOxygen !== undefined) {
    doValue.textContent = parseFloat(data.dissolvedOxygen).toFixed(2);
  }
  
  // Update last update time
  console.log('Sensor data updated:', new Date().toLocaleTimeString());
}

function addDataPointToChart(data) {
  if (!sensorChart) return;
  
  // Add timestamp
  const now = data.timestamp ? new Date(data.timestamp) : new Date();
  const timeLabel = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Check if this timestamp already exists (avoid duplicates)
  if (chartData.labels.includes(timeLabel)) {
    return;
  }
  
  // Add new data points
  chartData.labels.push(timeLabel);
  chartData.temperature.push(parseFloat(data.temperature) || 0);
  chartData.ph.push(parseFloat(data.ph) || 0);
  chartData.turbidity.push(parseFloat(data.turbidity) || 0);
  chartData.dissolvedOxygen.push(parseFloat(data.dissolvedOxygen) || 0);
  
  // Keep only last maxDataPoints
  if (chartData.labels.length > maxDataPoints) {
    chartData.labels.shift();
    chartData.temperature.shift();
    chartData.ph.shift();
    chartData.turbidity.shift();
    chartData.dissolvedOxygen.shift();
  }
  
  // Update chart
  sensorChart.update('none'); // 'none' mode for smoother animation
  
  console.log('Chart updated with new data point:', timeLabel);
}

// Example alternative paths you might need based on your Firebase structure:
// Expected Firebase Database Structure for this code:
/*
{
  "sensors": {
    "latest": {
      "temperature": 25.5,
      "ph": 7.2,
      "turbidity": 5.3,
      "dissolvedOxygen": 8.5,
      "timestamp": 1738454400000
    },
    "history": {
      "-N1234": {
        "temperature": 25.0,
        "ph": 7.1,
        "turbidity": 5.0,
        "dissolvedOxygen": 8.3,
        "timestamp": 1738454300000
      },
      "-N1235": {
        "temperature": 25.2,
        "ph": 7.15,
        "turbidity": 5.1,
        "dissolvedOxygen": 8.4,
        "timestamp": 1738454350000
      }
      // ... more historical readings
    }
  }
}

To test with simulated data, you can use this code snippet in browser console:
const db = firebase.database();
setInterval(() => {
  const data = {
    temperature: (20 + Math.random() * 10).toFixed(1),
    ph: (6.5 + Math.random() * 2).toFixed(2),
    turbidity: (1 + Math.random() * 10).toFixed(1),
    dissolvedOxygen: (6 + Math.random() * 4).toFixed(2),
    timestamp: Date.now()
  };
  db.ref('sensors/latest').set(data);
  db.ref('sensors/history').push(data);
}, 5000);
*/
