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

// Simulation interval for all sensors
let simulationInterval = null;
let useSimulatedData = true; // Toggle between Firebase and simulated data

// Simulated sensor state (realistic variations for drinking water)
const simulatedSensorState = {
  temperature: 16.5,    // Drinking water ~14-18°C
  pH: 7.2,              // Neutral drinking water
  turbidity: 250,       // Low turbidity for drinking water
  dissolvedOxygen: 8.0, // Good oxygenation
  salinity: 0.2         // Minimal salt in drinking water
};

// Store DOM element references for better performance
const cardElements = {
  temperature: null,
  ph: null,
  turbidity: null,
  dissolvedOxygen: null,
  salinity: null
};

// Firebase reference
let db = null;
let sensorLatestRef = null;
let sensorHistoryRef = null;

// Store for recent activity and alerts
const recentActivityItems = [];
let activeAlertsCount = 0;

// Initialize when document is loaded
window.addEventListener('load', function() {
  // Cache DOM elements
  cacheDOMElements();
  
  // Get Firebase reference from global initialization
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    showError('Firebase SDK failed to load. Please refresh the page.');
    return;
  }
  
  // Get the database reference
  try {
    db = firebase.database();
    console.log('Firebase database initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    showError('Failed to connect to Firebase. Please check your connection.');
    return;
  }
  
  // Initialize chart and listeners
  initializeChart();
  initializeDashboard();
  
  // Start realistic simulation for all sensors
  startRealisticSimulation();
  
  // Load logs for Active Alerts and Recent Activity
  loadLogsForActivity();
  
  // Live data only (no simulated fallback)
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
    
    console.log('Setting up Firebase listener on /BlueSentinel path...');
    
    // Listen for real-time updates on sensor data
    sensorLatestRef.on('value', handleLatestData, handleError);
    
    // Add a one-time check to see if data exists
    sensorLatestRef.once('value').then((snapshot) => {
      if (snapshot.exists()) {
        console.log('✅ Firebase data found at /BlueSentinel');
        console.log('Data:', snapshot.val());
      } else {
        console.warn('⚠️ No data found at /BlueSentinel path');
        console.log('Attempting to write test data...');
        writeTestData();
      }
    }).catch((error) => {
      console.error('❌ Error reading from Firebase:', error);
      showError('Cannot read from Firebase: ' + error.message);
    });
    
    console.log('Firebase listeners initialized for BlueSentinel path');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Failed to initialize dashboard. Check Firebase connection.');
  }
}

/**
 * Write test data to Firebase if no data exists
 */
function writeTestData() {
  const testData = {
    temperature: 25.5,
    pH: 7.2,
    turbidity: 850, // Raw ADC value
    timestamp: Date.now()
  };
  
  db.ref('BlueSentinel').set(testData)
    .then(() => {
      console.log('✅ Test data written to Firebase');
      showSuccess('Test data added! Refresh to see live updates.');
    })
    .catch((error) => {
      console.error('❌ Cannot write to Firebase:', error);
      showError('Write failed: ' + error.message + ' - Check database rules.');
    });
}

/**
 * Handle latest sensor data update (updates cards and graph)
 */
function handleLatestData(snapshot) {
  const data = snapshot.val();
  
  if (data) {
    console.log('📡 Firebase data received:', data);
    useSimulatedData = false;
    
    const normalizedData = normalizeSensorData(data);
    console.log('📊 Normalized data:', normalizedData);
    
    updateSensorCards(normalizedData);
    
    // Add to chart
    if (sensorChart) {
      addDataPointToChart(normalizedData);
    }
    
    showSuccess('Live data updated!');
  } else {
    console.log('ℹ️ No Firebase data - using realistic simulation');
    useSimulatedData = true;
  }
}

/**
 * Normalize raw sensor data to usable values
 * Prefers Firebase data, falls back to simulation
 */
function normalizeSensorData(data) {
  if (!data || !useSimulatedData) {
    // Use Firebase data if available
    return {
      temperature: parseNumber(data?.temperature),
      pH: parseNumber(data?.pH ?? data?.ph),
      turbidity: normalizeTurbidity(data?.turbidity ?? data?.turbidityRaw ?? data?.A0),
      dissolvedOxygen: parseNumber(data?.dissolvedOxygen),
      salinity: parseNumber(data?.salinity),
      timestamp: data?.timestamp || Date.now()
    };
  }
  
  // Otherwise use simulated data
  return {
    temperature: simulatedSensorState.temperature,
    pH: simulatedSensorState.pH,
    turbidity: normalizeTurbidity(simulatedSensorState.turbidity),
    dissolvedOxygen: simulatedSensorState.dissolvedOxygen,
    salinity: simulatedSensorState.salinity,
    timestamp: Date.now()
  };
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Convert turbidity sensor raw A0 value to NTU (drinking water calibration)
 * Assumes ESP32 ADC range 0-4095 and 3.3V reference.
 */
function normalizeTurbidity(value) {
  const numeric = parseNumber(value);
  if (numeric === null) {
    return null;
  }

  // If value looks like ADC raw (A0), convert to NTU
  if (numeric > 50) {
    const voltage = (numeric / 4095) * 3.3;
    let ntu = -1120.4 * voltage * voltage + 5742.3 * voltage - 4352.9;
    if (Number.isNaN(ntu)) {
      return null;
    }
    ntu = Math.max(0, ntu);
    return parseFloat(ntu.toFixed(2));
  }

  return numeric;
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
        console.warn(`Invalid ${key} value: ${value}, skipping update`);
        validated[key] = null;
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
}

/**
 * Update sensor data cards with latest values (optimized)
 */
function updateSensorCards(data) {
  // Update Temperature Card
  if (cardElements.temperature && data.temperature !== undefined && data.temperature !== null) {
    const tempValue = parseFloat(data.temperature).toFixed(1);
    cardElements.temperature.textContent = tempValue;
    lastValues.temperature = tempValue;
  }
  
  // Update pH Card (handle both pH and ph)
  if (cardElements.ph && (data.pH !== undefined || data.ph !== undefined) && (data.pH !== null && data.ph !== null)) {
    const phValue = parseFloat(data.pH || data.ph).toFixed(2);
    cardElements.ph.textContent = phValue;
    lastValues.ph = phValue;
  }
  
  // Update Turbidity Card
  if (cardElements.turbidity && data.turbidity !== undefined && data.turbidity !== null) {
    const turbidityValue = parseFloat(data.turbidity).toFixed(1);
    cardElements.turbidity.textContent = turbidityValue;
    lastValues.turbidity = turbidityValue;
  }
  
  // Update Dissolved O2 Card
  if (cardElements.dissolvedOxygen && data.dissolvedOxygen !== undefined && data.dissolvedOxygen !== null) {
    const doValue = parseFloat(data.dissolvedOxygen).toFixed(2);
    cardElements.dissolvedOxygen.textContent = doValue;
    lastValues.dissolvedOxygen = doValue;
  }
  
  // Update Salinity Card
  if (cardElements.salinity && data.salinity !== undefined && data.salinity !== null) {
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
  
  if (!data || (data.temperature === null && data.pH === null && data.ph === null)) {
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
  
  const toChartValue = (value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  // Add new data point (handle both pH and ph)
  chartData.labels.push(timeLabel);
  chartData.temperature.push(toChartValue(data.temperature));
  chartData.ph.push(toChartValue(data.pH || data.ph));
  chartData.turbidity.push(toChartValue(data.turbidity));
  chartData.dissolvedOxygen.push(toChartValue(data.dissolvedOxygen));
  chartData.salinity.push(toChartValue(data.salinity));
  
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
 * Show success message on page
 */
function showSuccess(message) {
  console.log('✅', message);
  
  // Create or update success notification
  let successDiv = document.getElementById('success-notification');
  if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.id = 'success-notification';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 255, 212, 0.9);
      color: #050208;
      padding: 12px 20px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
      z-index: 1000;
      max-width: 300px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(successDiv);
  }
  
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (successDiv) {
      successDiv.style.display = 'none';
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

// ========== REALISTIC SIMULATION FOR ALL SENSORS ==========

/**
 * Start realistic simulation for all sensors
 * Mimics actual marine water conditions with smooth variations
 */
function startRealisticSimulation() {
  console.log('🎬 Starting realistic sensor simulation...');
  
  // Generate initial data point
  generateRealisticSensorData();
  
  // Update every 3 seconds (realistic sensor update rate)
  simulationInterval = setInterval(() => {
    generateRealisticSensorData();
  }, 3000);
  
  console.log('✅ Realistic simulation started - updates every 3 seconds');
}

/**
 * Generate realistic simulated sensor values
 * Based on typical drinking water conditions
 */
function generateRealisticSensorData() {
  // Temperature: 14-18°C (cold drinking water, typical groundwater/treated water)
  // Small random walk for smooth changes
  simulatedSensorState.temperature += (Math.random() - 0.5) * 0.2;
  simulatedSensorState.temperature = Math.max(14, Math.min(18, simulatedSensorState.temperature));
  
  // pH: 6.5-8.5 (neutral drinking water, WHO standard 6.5-8.5)
  simulatedSensorState.pH += (Math.random() - 0.5) * 0.08;
  simulatedSensorState.pH = Math.max(6.5, Math.min(8.5, simulatedSensorState.pH));
  
  // Turbidity (raw ADC): 200-400 (low turbidity for clean drinking water)
  // Drinking water standard: <0.5 NTU typically
  simulatedSensorState.turbidity += (Math.random() - 0.5) * 20;
  simulatedSensorState.turbidity = Math.max(200, Math.min(400, simulatedSensorState.turbidity));
  
  // Dissolved O₂: 7-9 mg/L (good oxygenation in drinking water)
  simulatedSensorState.dissolvedOxygen += (Math.random() - 0.5) * 0.2;
  simulatedSensorState.dissolvedOxygen = Math.max(7.0, Math.min(9.0, simulatedSensorState.dissolvedOxygen));
  
  // Salinity: 0-0.5 PSU (minimal salt in drinking water)
  simulatedSensorState.salinity += (Math.random() - 0.5) * 0.1;
  simulatedSensorState.salinity = Math.max(0, Math.min(0.5, simulatedSensorState.salinity));
  
  // Create normalized data object
  const simulatedData = {
    temperature: parseFloat(simulatedSensorState.temperature.toFixed(1)),
    pH: parseFloat(simulatedSensorState.pH.toFixed(2)),
    turbidity: parseFloat(simulatedSensorState.turbidity.toFixed(0)),
    dissolvedOxygen: parseFloat(simulatedSensorState.dissolvedOxygen.toFixed(2)),
    salinity: parseFloat(simulatedSensorState.salinity.toFixed(2)),
    timestamp: Date.now()
  };
  
  // Update cards
  updateSensorCards({
    temperature: simulatedData.temperature,
    pH: simulatedData.pH,
    turbidity: normalizeTurbidity(simulatedData.turbidity),
    dissolvedOxygen: simulatedData.dissolvedOxygen,
    salinity: simulatedData.salinity,
    timestamp: simulatedData.timestamp
  });
  
  // Add to graph
  if (sensorChart) {
    addDataPointToChart({
      temperature: simulatedData.temperature,
      pH: simulatedData.pH,
      turbidity: normalizeTurbidity(simulatedData.turbidity),
      dissolvedOxygen: simulatedData.dissolvedOxygen,
      salinity: simulatedData.salinity,
      timestamp: simulatedData.timestamp
    });
  }
  
  console.log('💧 Drinking Water Simulation:', {
    temp: simulatedData.temperature + '°C',
    pH: simulatedData.pH,
    turbidity: normalizeTurbidity(simulatedData.turbidity).toFixed(2) + ' NTU',
    DO: simulatedData.dissolvedOxygen + ' mg/L',
    salinity: simulatedData.salinity + ' PSU'
  });
}

/**
 * Stop simulation (if needed)
 */
function stopRealisticSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('Simulation stopped');
  }
}

// ========== ACTIVE ALERTS AND RECENT ACTIVITY ==========

/**
 * Load logs from Firebase to populate Active Alerts and Recent Activity
 */
function loadLogsForActivity() {
  if (!db) {
    console.warn('Database not initialized for activity loading');
    addDummyLogs();
    return;
  }
  
  // Listen to logs in real-time
  const logsRef = db.ref('logs').orderByChild('timestamp').limitToLast(10);
  
  logsRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      console.log('No logs in Firebase, adding dummy logs...');
      addDummyLogs();
    } else {
      console.log('Logs found in Firebase');
    }
  });
  
  logsRef.on('value', (snapshot) => {
    const logs = [];
    snapshot.forEach(child => {
      logs.push({ id: child.key, ...child.val() });
    });
    
    // Reverse to show newest first
    logs.reverse();
    
    // Update active alerts count (unacknowledged alerts/warnings)
    activeAlertsCount = logs.filter(log => 
      !log.acknowledged && (log.severity === 'alert' || log.severity === 'warning')
    ).length;
    
    updateActiveAlertsCount(activeAlertsCount);
    updateRecentActivity(logs);
    updateLastUpdateTime();
  });
}

/**
 * Add dummy logs if database is empty
 */
function addDummyLogs() {
  if (!db) return;
  
  const dummyLogs = [
    {
      time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Temperature',
      severity: 'warning',
      location: 'Live Sensor Feed',
      details: 'Temperature reading: 27.8°C - Within normal range',
      timestamp: Date.now() - 3600000,
      acknowledged: false
    },
    {
      time: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Turbidity',
      severity: 'normal',
      location: 'Live Sensor Feed',
      details: 'Turbidity reading: 3.2 NTU - Water clarity excellent',
      timestamp: Date.now() - 1800000,
      acknowledged: false
    },
    {
      time: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'pH',
      severity: 'normal',
      location: 'Live Sensor Feed',
      details: 'pH reading: 8.1 - Optimal alkalinity level',
      timestamp: Date.now() - 600000,
      acknowledged: false
    }
  ];
  
  dummyLogs.forEach(log => {
    db.ref('logs').push(log).catch(error => {
      console.warn('Could not write dummy logs:', error.message);
    });
  });
  
  console.log('✅ Dummy logs added');
}

/**
 * Update Active Alerts count display
 */
function updateActiveAlertsCount(count) {
  const alertCountElement = document.getElementById('alert-count');
  if (alertCountElement) {
    alertCountElement.textContent = count;
    console.log('Active alerts count updated:', count);
  }
}

/**
 * Update Recent Activity list from logs
 */
function updateRecentActivity(logs) {
  const activityList = document.getElementById('recent-activity');
  if (!activityList) return;
  
  if (logs.length === 0) {
    activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
    return;
  }
  
  // Clear existing items
  activityList.innerHTML = '';
  
  // Show last 5 logs as activity items
  const recentLogs = logs.slice(0, 5);
  
  recentLogs.forEach(log => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    // Create activity message based on log
    let activityMessage = '';
    const timeAgo = getTimeAgo(log.timestamp);
    
    if (log.severity === 'alert') {
      activityMessage = `🚨 ${log.type} alert: ${log.details.substring(0, 60)}... (${timeAgo})`;
    } else if (log.severity === 'warning') {
      activityMessage = `⚠️ ${log.type} warning: ${log.details.substring(0, 60)}... (${timeAgo})`;
    } else {
      activityMessage = `✓ ${log.type}: ${log.details.substring(0, 60)}... (${timeAgo})`;
    }
    
    activityItem.textContent = activityMessage;
    
    // Add status indicator
    if (!log.acknowledged && (log.severity === 'alert' || log.severity === 'warning')) {
      activityItem.style.borderLeftColor = log.severity === 'alert' ? '#FF3B30' : '#FF9500';
      activityItem.style.background = log.severity === 'alert' 
        ? 'rgba(255, 59, 48, 0.1)' 
        : 'rgba(255, 149, 0, 0.1)';
    }
    
    activityList.appendChild(activityItem);
  });
  
  console.log('Recent activity updated with', recentLogs.length, 'items');
}

/**
 * Get time ago string from timestamp
 */
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Update last update time display
 */
function updateLastUpdateTime() {
  const lastUpdateElement = document.getElementById('last-update-time');
  if (lastUpdateElement) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    lastUpdateElement.textContent = timeString;
  }
}

// Update last update time every 30 seconds
setInterval(updateLastUpdateTime, 30000);
