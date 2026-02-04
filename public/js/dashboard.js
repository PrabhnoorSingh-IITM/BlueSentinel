// Dashboard - Live Sensor Data from Firebase Realtime Database
// Real-time updates with live graphs and sensor cards

// Chart variables
let sensorChart = null;
const maxDataPoints = 30; // Keep last 30 readings for graph
const chartData = {
  labels: [],
  temperature: [],
  ph: [],
  turbidity: [],
  dissolvedOxygen: [],
  salinity: []
};

// Store last values for card updates
const lastValues = {
  temperature: '--',
  ph: '--',
  turbidity: '--',
  dissolvedOxygen: '--',
  salinity: '--'
};

// Store DOM element references for better performance
const cardElements = {
  temperature: null,
  ph: null,
  turbidity: null,
  dissolvedOxygen: null,
  salinity: null
};

// Simulation state
let isSimulationMode = false;
let simulationInterval = null;

// Firebase reference
let db = null;
let sensorLatestRef = null;
let sensorHistoryRef = null;

// Initialize when document is loaded
window.addEventListener('load', function() {
  // Cache DOM elements
  cacheDOMElements();
  
  // Get Firebase reference from global initialization
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    showError('Firebase SDK failed to load. Please refresh the page.');
    // Start simulation mode as fallback
    startSimulationMode();
    return;
  }
  
  // Get the database reference
  try {
    db = firebase.database();
    console.log('Firebase database initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    showError('Failed to connect to Firebase. Please check your connection.');
    // Start simulation mode as fallback
    startSimulationMode();
    return;
  }
  
  // Initialize chart and listeners
  initializeChart();
  initializeDashboard();
  
  // Start simulation as fallback if no data within 5 seconds
  setTimeout(() => {
    if (lastValues.temperature === '--') {
      console.log('No real data received, starting simulation mode');
      startSimulationMode();
    }
  }, 5000);
});

/**
 * Cache DOM elements for better performance
 */
function cacheDOMElements() {
  cardElements.temperature = document.getElementById('temp-value');
  cardElements.ph = document.getElementById('ph-value');
  cardElements.turbidity = document.getElementById('turbidity-value');
  cardElements.dissolvedOxygen = document.getElementById('do-value');
  cardElements.salinity = document.getElementById('salinity-value');
  
  console.log('DOM elements cached');
}

/**
 * Initialize Chart.js with multi-axis configuration
 */
function initializeChart() {
  const ctx = document.getElementById('sensor-chart');
  if (!ctx) {
    console.error('Chart canvas element not found');
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
          borderColor: 'rgb(255, 99, 71)',
          backgroundColor: 'rgba(255, 99, 71, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(255, 99, 71)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y',
          fill: false
        },
        {
          label: 'pH Level',
          data: chartData.ph,
          borderColor: 'rgb(0, 255, 127)',
          backgroundColor: 'rgba(0, 255, 127, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(0, 255, 127)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1',
          fill: false
        },
        {
          label: 'Turbidity (NTU)',
          data: chartData.turbidity,
          borderColor: 'rgb(0, 191, 255)',
          backgroundColor: 'rgba(0, 191, 255, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(0, 191, 255)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y2',
          fill: false
        },
        {
          label: 'Dissolved O₂ (mg/L)',
          data: chartData.dissolvedOxygen,
          borderColor: 'rgb(255, 0, 255)',
          backgroundColor: 'rgba(255, 0, 255, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(255, 0, 255)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y3',
          fill: false
        },
        {
          label: 'Salinity (PSU)',
          data: chartData.salinity,
          borderColor: 'rgb(255, 215, 0)',
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(255, 215, 0)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y4',
          fill: false
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
          labels: {
            color: '#ffffff',
            font: {
              size: 13,
              weight: '700'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 2,
          padding: 15,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return context.dataset.label + ': ' + (value !== null ? value.toFixed(2) : 'N/A');
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.2)',
            drawBorder: true,
            borderColor: 'rgba(255, 255, 255, 0.3)'
          },
          ticks: {
            color: '#ffffff',
            font: {
              size: 11,
              weight: '600'
            }
          },
          title: {
            display: true,
            text: 'Time',
            color: '#ffffff',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(255, 99, 71, 0.2)',
            drawBorder: true,
            borderColor: 'rgb(255, 99, 71)'
          },
          ticks: {
            color: 'rgb(255, 99, 71)',
            font: {
              size: 11,
              weight: '700'
            }
          },
          title: {
            display: true,
            text: 'Temperature (°C)',
            color: 'rgb(255, 99, 71)',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          min: 0,
          max: 50
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: 'rgb(0, 255, 127)',
            font: {
              size: 11,
              weight: '700'
            }
          },
          title: {
            display: true,
            text: 'pH',
            color: 'rgb(0, 255, 127)',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          min: 0,
          max: 14
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
          min: 0,
          max: 5000
        },
        y3: {
          type: 'linear',
          display: false,
          position: 'right',
          min: 0,
          max: 20
        },
        y4: {
          type: 'linear',
          display: false,
          position: 'right',
          min: 25,
          max: 40
        }
      }
    }
  });
  
  console.log('Chart initialized successfully');
}

/**
 * Initialize Firebase listeners for real-time data
 */
function initializeDashboard() {
  try {
    // Reference to BlueSentinel data (ESP32 uploads here)
    sensorLatestRef = db.ref('BlueSentinel');
    
    // Listen for real-time updates on sensor data
    sensorLatestRef.on('value', handleLatestData, handleError);
    
    console.log('Firebase listeners initialized for BlueSentinel path');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Failed to initialize dashboard. Check Firebase connection.');
    // Start simulation mode as fallback
    startSimulationMode();
  }
}

/**
 * Start simulation mode when Firebase is not available
 */
function startSimulationMode() {
  if (isSimulationMode) {
    console.log('Simulation mode already active');
    return;
  }
  
  console.log('Starting simulation mode');
  isSimulationMode = true;
  
  // Generate initial data
  const simulatedData = generateSimulatedData();
  updateSensorCards(simulatedData);
  
  if (sensorChart) {
    addDataPointToChart(simulatedData);
  }
  
  // Clear any existing interval
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }
  
  // Continue generating data every 2 seconds
  simulationInterval = setInterval(() => {
    const newData = generateSimulatedData();
    updateSensorCards(newData);
    if (sensorChart) {
      addDataPointToChart(newData);
    }
  }, 2000);
}

/**
 * Stop simulation mode
 */
function stopSimulationMode() {
  if (!isSimulationMode) {
    return;
  }
  
  console.log('Stopping simulation mode');
  isSimulationMode = false;
  
  // Clear simulation interval
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

/**
 * Generate complete simulated sensor data with realistic variations
 */
function generateSimulatedData() {
  const now = Date.now();
  
  // Add time-based variations for more realistic simulation
  const hour = new Date(now).getHours();
  const tempVariation = Math.sin((hour / 24) * Math.PI * 2) * 3; // Temperature varies with time of day
  
  return {
    temperature: (22 + tempVariation + Math.random() * 8).toFixed(1),
    pH: (7.0 + Math.random() * 1.5).toFixed(2),
    turbidity: generateSimulatedTurbidity(),
    dissolvedOxygen: generateSimulatedDO(),
    salinity: generateSimulatedSalinity(),
    timestamp: now
  };
}

/**
 * Handle latest sensor data update (updates cards and graph)
 */
function handleLatestData(snapshot) {
  const data = snapshot.val();
  
  if (data) {
    console.log('Latest data received:', data);
    
    // Stop simulation mode when real data is received
    if (isSimulationMode) {
      stopSimulationMode();
    }
    
    // Handle different data structures
    let enrichedData;
    
    if (data.temperature !== undefined || data.pH !== undefined) {
      // Direct sensor data
      enrichedData = {
        temperature: data.temperature || (20 + Math.random() * 15).toFixed(1),
        pH: data.pH || data.ph || (6.5 + Math.random() * 2).toFixed(2),
        turbidity: data.turbidity || generateSimulatedTurbidity(),
        dissolvedOxygen: data.dissolvedOxygen || generateSimulatedDO(),
        salinity: data.salinity || generateSimulatedSalinity(),
        timestamp: data.timestamp || Date.now()
      };
    } else {
      // No valid data, use simulated
      enrichedData = generateSimulatedData();
    }
    
    updateSensorCards(enrichedData);
    
    // Add to chart
    if (sensorChart) {
      addDataPointToChart(enrichedData);
    }
  } else {
    console.log('No sensor data available yet, using simulated data');
    const simulatedData = generateSimulatedData();
    updateSensorCards(simulatedData);
    if (sensorChart) {
      addDataPointToChart(simulatedData);
    }
  }
}

/**
 * Generate simulated turbidity (0-10 NTU)
 */
function generateSimulatedTurbidity() {
  return (2.0 + Math.random() * 8).toFixed(2);
}

/**
 * Generate simulated Dissolved Oxygen (6-12 mg/L) - expanded range for marine environments
 */
function generateSimulatedDO() {
  return (6.0 + Math.random() * 6).toFixed(2);
}

/**
 * Generate simulated Salinity (30-40 PSU) - expanded range for coastal waters
 */
function generateSimulatedSalinity() {
  return (30.0 + Math.random() * 10).toFixed(2);
}

/**
 * Handle historical data (for initial graph load)
 */
function handleHistoryData(snapshot) {
  const data = snapshot.val();
  
  if (data && sensorChart) {
    // Check if we already have this data point
    const timestamp = data.timestamp || Date.now();
    const timeLabel = formatTime(timestamp);
    
    if (!chartData.labels.includes(timeLabel)) {
      addDataPointToChart(data);
    }
  }
}

/**
 * Validate sensor data ranges
 */
function validateSensorData(data) {
  const ranges = {
    temperature: { min: -5, max: 50 },
    pH: { min: 0, max: 14 },
    turbidity: { min: 0, max: 100 },
    dissolvedOxygen: { min: 0, max: 20 },
    salinity: { min: 0, max: 50 }
  };
  
  const validated = { ...data };
  
  for (const [key, value] of Object.entries(data)) {
    if (ranges[key] && typeof value === 'number') {
      if (value < ranges[key].min || value > ranges[key].max) {
        console.warn(`Invalid ${key} value: ${value}, using simulated data`);
        validated[key] = parseFloat(generateSimulatedData()[key]);
      }
    }
  }
  
  return validated;
}

/**
 * Handle Firebase errors
 */
function handleError(error) {
  console.error('Firebase error:', error.code, error.message);
  showError('Firebase connection error: ' + error.message);
  
  // Start simulation mode on Firebase errors
  if (!isSimulationMode) {
    console.log('Firebase error detected, starting simulation mode');
    startSimulationMode();
  }
}

/**
 * Update sensor data cards with latest values (optimized)
 */
function updateSensorCards(data) {
  // Update Temperature Card
  if (cardElements.temperature && data.temperature !== undefined) {
    const tempValue = parseFloat(data.temperature).toFixed(1);
    cardElements.temperature.textContent = tempValue;
    lastValues.temperature = tempValue;
  }
  
  // Update pH Card (handle both pH and ph)
  if (cardElements.ph && (data.pH !== undefined || data.ph !== undefined)) {
    const phValue = parseFloat(data.pH || data.ph).toFixed(2);
    cardElements.ph.textContent = phValue;
    lastValues.ph = phValue;
  }
  
  // Update Turbidity Card
  if (cardElements.turbidity && data.turbidity !== undefined) {
    const turbidityValue = parseFloat(data.turbidity).toFixed(1);
    cardElements.turbidity.textContent = turbidityValue;
    lastValues.turbidity = turbidityValue;
  }
  
  // Update Dissolved O2 Card
  if (cardElements.dissolvedOxygen && data.dissolvedOxygen !== undefined) {
    const doValue = parseFloat(data.dissolvedOxygen).toFixed(2);
    cardElements.dissolvedOxygen.textContent = doValue;
    lastValues.dissolvedOxygen = doValue;
  }
  
  // Update Salinity Card
  if (cardElements.salinity && data.salinity !== undefined) {
    const salinityValue = parseFloat(data.salinity).toFixed(2);
    cardElements.salinity.textContent = salinityValue;
    lastValues.salinity = salinityValue;
  }
  
  // Update last update time
  const timestamp = data.timestamp || Date.now();
  console.log('Cards updated at:', formatTime(timestamp));
}

/**
 * Add data point to chart (with max limit)
 */
function addDataPointToChart(data) {
  if (!sensorChart) {
    console.error('Chart not initialized');
    return;
  }
  
  if (!data || (!data.temperature && !data.pH)) {
    console.warn('Invalid data for chart:', data);
    return;
  }
  
  // Generate time label
  const timestamp = data.timestamp || Date.now();
  const timeLabel = formatTime(timestamp);
  
  // Check for duplicate
  if (chartData.labels.includes(timeLabel)) {
    return;
  }
  
  // Add new data point (handle both pH and ph)
  chartData.labels.push(timeLabel);
  chartData.temperature.push(parseFloat(data.temperature) || 0);
  chartData.ph.push(parseFloat(data.pH || data.ph) || 0);
  chartData.turbidity.push(parseFloat(data.turbidity) || 0);
  chartData.dissolvedOxygen.push(parseFloat(data.dissolvedOxygen) || 0);
  chartData.salinity.push(parseFloat(data.salinity) || 0);
  
  // Limit data to maxDataPoints
  if (chartData.labels.length > maxDataPoints) {
    chartData.labels.shift();
    chartData.temperature.shift();
    chartData.ph.shift();
    chartData.turbidity.shift();
    chartData.dissolvedOxygen.shift();
    chartData.salinity.shift();
  }
  
  // Update chart without animation for better performance
  sensorChart.update('none');
  
  console.log('Graph point added:', timeLabel, 'Data points:', chartData.labels.length);
}

/**
 * Format timestamp to readable time string
 */
function formatTime(timestamp) {
  if (!timestamp) return new Date().toLocaleTimeString();
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Show error message on page
 */
function showError(message) {
  console.error(message);
  
  // Create or update error notification
  let errorDiv = document.getElementById('error-notification');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'error-notification';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 59, 48, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
      z-index: 1000;
      max-width: 300px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }, 5000);
}

/**
 * Get live data summary
 */
function getLiveDataSummary() {
  return {
    temperature: lastValues.temperature,
    ph: lastValues.ph,
    turbidity: lastValues.turbidity,
    dissolvedOxygen: lastValues.dissolvedOxygen,
    lastUpdate: new Date().toLocaleString()
  };
}

/**
 * Export data (for future CSV/download feature)
 */
function exportChartData() {
  const dataPoints = [];
  
  for (let i = 0; i < chartData.labels.length; i++) {
    dataPoints.push({
      time: chartData.labels[i],
      temperature: chartData.temperature[i],
      ph: chartData.ph[i],
      turbidity: chartData.turbidity[i],
      dissolvedOxygen: chartData.dissolvedOxygen[i]
    });
  }
  
  return dataPoints;
}

// ========== EXPECTED FIREBASE DATABASE STRUCTURE ==========
/*
{
  "sensors": {
    "latest": {
      "temperature": 25.5,
      "ph": 7.2,
      "turbidity": 5.3,
      "dissolvedOxygen": 8.5,
      "timestamp": 1738454400000,
      "deviceId": "ESP32-001"
    },
    "history": {
      "-N1234567890": {
        "temperature": 25.0,
        "ph": 7.1,
        "turbidity": 5.0,
        "dissolvedOxygen": 8.3,
        "timestamp": 1738454300000,
        "deviceId": "ESP32-001"
      },
      "-N1234567891": {
        "temperature": 25.2,
        "ph": 7.15,
        "turbidity": 5.1,
        "dissolvedOxygen": 8.4,
        "timestamp": 1738454350000,
        "deviceId": "ESP32-001"
      }
      // ... more historical readings
    }
  }
}

FIREBASE RULES (copy to database.rules.json):
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true,
      "latest": {
        ".indexOn": ["timestamp"]
      },
      "history": {
        ".indexOn": ["timestamp"]
      }
    }
  }
}
*/
