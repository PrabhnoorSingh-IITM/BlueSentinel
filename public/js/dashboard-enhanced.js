// Enhanced Dashboard with Separate Graphs and Normal Range Highlighting

// Chart variables
let sensorChart = null;
let tempPhChart = null;
let turbidityOxygenChart = null;
let salinityChart = null;

const maxDataPoints = 30;
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

const mlElements = {
  nitrogen: null,
  ammonia: null,
  lead: null,
  sodium: null
};

// Simulation state
let isSimulationMode = false;
let simulationInterval = null;

// Firebase reference
let db = null;
let sensorLatestRef = null;

// Normal ranges for highlighting
const normalRanges = {
  temperature: { min: 20, max: 30, unit: '°C' },
  ph: { min: 6.5, max: 8.5, unit: 'pH' },
  turbidity: { min: 0, max: 5, unit: 'NTU' },
  dissolvedOxygen: { min: 6, max: 8, unit: 'mg/L' },
  salinity: { min: 30, max: 40, unit: 'PSU' }
};

// Initialize when document is loaded
window.addEventListener('load', function () {
  // Cache DOM elements
  cacheDOMElements();
  cacheMLElements();

  // Setup CSV Export
  setupCSVExport();

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

  // Initialize charts and listeners
  initializeCharts();
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

function cacheMLElements() {
  mlElements.nitrogen = document.getElementById('ml-nitrogen');
  mlElements.ammonia = document.getElementById('ml-ammonia');
  mlElements.lead = document.getElementById('ml-lead');
  mlElements.sodium = document.getElementById('ml-sodium');
}

/**
 * Initialize all charts
 */
function initializeCharts() {
  initializeTempPhChart();
  initializeTurbidityOxygenChart();
  initializeSalinityChart();
  initializeCombinedChart();
}

/**
 * Initialize Temperature & pH Chart
 */
function initializeTempPhChart() {
  const ctx = document.getElementById('temp-ph-chart');
  if (!ctx) {
    console.error('Temperature & pH chart canvas not found');
    return;
  }

  tempPhChart = new Chart(ctx, {
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
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#D2DDFF',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(5, 2, 8, 0.8)',
          titleColor: '#00FFD4',
          bodyColor: '#D2DDFF',
          borderColor: 'rgba(0, 255, 212, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        }
      }
    }
  });
}

/**
 * Initialize Turbidity & Oxygen Chart
 */
function initializeTurbidityOxygenChart() {
  const ctx = document.getElementById('turbidity-oxygen-chart');
  if (!ctx) {
    console.error('Turbidity & Oxygen chart canvas not found');
    return;
  }

  turbidityOxygenChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
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
          yAxisID: 'y',
          fill: false
        },
        {
          label: 'Dissolved O₂ (mg/L)',
          data: chartData.dissolvedOxygen,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(255, 159, 64)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#D2DDFF',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(5, 2, 8, 0.8)',
          titleColor: '#00FFD4',
          bodyColor: '#D2DDFF',
          borderColor: 'rgba(0, 255, 212, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        }
      }
    }
  });
}

/**
 * Initialize Salinity Chart
 */
function initializeSalinityChart() {
  const ctx = document.getElementById('salinity-chart');
  if (!ctx) {
    console.error('Salinity chart canvas not found');
    return;
  }

  salinityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Salinity (PSU)',
          data: chartData.salinity,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#D2DDFF',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(5, 2, 8, 0.8)',
          titleColor: '#00FFD4',
          bodyColor: '#D2DDFF',
          borderColor: 'rgba(0, 255, 212, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        }
      }
    }
  });
}

/**
 * Initialize Combined Overview Chart
 */
function initializeCombinedChart() {
  const ctx = document.getElementById('sensor-chart');
  if (!ctx) {
    console.error('Combined chart canvas not found');
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
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(255, 159, 64)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'y3',
          fill: false
        },
        {
          label: 'Salinity (PSU)',
          data: chartData.salinity,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(75, 192, 192)',
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
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#D2DDFF',
            font: {
              size: 12
            },
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(5, 2, 8, 0.8)',
          titleColor: '#00FFD4',
          bodyColor: '#D2DDFF',
          borderColor: 'rgba(0, 255, 212, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(210, 221, 255, 0.1)'
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y2: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y3: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        },
        y4: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#D2DDFF'
          }
        }
      }
    }
  });
}

/**
 * Initialize dashboard
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
 * Handle latest sensor data update (updates cards and graphs)
 */
function handleLatestData(snapshot) {
  const data = snapshot.val();

  if (data) {
    console.log('Latest data received:', data);

    // Handle different data structures
    let enrichedData;

    if (data.temperature !== undefined || data.pH !== undefined) {
      // Direct sensor data
      enrichedData = {
        temperature: data.temperature || (20 + Math.random() * 15).toFixed(1),
        pH: data.pH || data.ph || (6.5 + Math.random() * 2).toFixed(2),
        turbidity: data.turbidity || (2.0 + Math.random() * 8).toFixed(2),
        dissolvedOxygen: data.dissolvedOxygen || (6.0 + Math.random() * 6).toFixed(2),
        salinity: data.salinity || (30.0 + Math.random() * 10).toFixed(2),
        timestamp: data.timestamp || Date.now()
      };
    } else {
      // No valid data, use simulated
      enrichedData = generateSimulatedData();
    }

    updateSensorCards(enrichedData);
    updateMLIndicators(); // Update ML indicators with every sensor update
    updateAllCharts(enrichedData);
  } else {
    console.log('No sensor data available yet, using simulated data');
    const simulatedData = generateSimulatedData();
    updateSensorCards(simulatedData);
    updateMLIndicators();
    updateAllCharts(simulatedData);
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

    // Add normal range highlighting
    const tempCard = cardElements.temperature.closest('.box');
    if (tempCard) {
      highlightNormalRange(tempCard, parseFloat(tempValue), normalRanges.temperature);
    }
  }

  // Update pH Card (handle both pH and ph)
  if (cardElements.ph && (data.pH !== undefined || data.ph !== undefined)) {
    const phValue = parseFloat(data.pH || data.ph).toFixed(2);
    cardElements.ph.textContent = phValue;
    lastValues.ph = phValue;

    // Add normal range highlighting
    const phCard = cardElements.ph.closest('.box');
    if (phCard) {
      highlightNormalRange(phCard, parseFloat(phValue), normalRanges.ph);
    }
  }

  // Update Turbidity Card
  if (cardElements.turbidity && data.turbidity !== undefined) {
    const turbidityValue = parseFloat(data.turbidity).toFixed(2);
    cardElements.turbidity.textContent = turbidityValue;
    lastValues.turbidity = turbidityValue;

    // Add normal range highlighting
    const turbidityCard = cardElements.turbidity.closest('.box');
    if (turbidityCard) {
      highlightNormalRange(turbidityCard, parseFloat(turbidityValue), normalRanges.turbidity);
    }
  }

  // Update Dissolved O2 Card
  if (cardElements.dissolvedOxygen && data.dissolvedOxygen !== undefined) {
    const doValue = parseFloat(data.dissolvedOxygen).toFixed(2);
    cardElements.dissolvedOxygen.textContent = doValue;
    lastValues.dissolvedOxygen = doValue;

    // Add normal range highlighting
    const doCard = cardElements.dissolvedOxygen.closest('.box');
    if (doCard) {
      highlightNormalRange(doCard, parseFloat(doValue), normalRanges.dissolvedOxygen);
    }
  }

  // Update Salinity Card
  if (cardElements.salinity && data.salinity !== undefined) {
    const salinityValue = parseFloat(data.salinity).toFixed(2);
    cardElements.salinity.textContent = salinityValue;
    lastValues.salinity = salinityValue;

    // Add normal range highlighting
    const salinityCard = cardElements.salinity.closest('.box');
    if (salinityCard) {
      highlightNormalRange(salinityCard, parseFloat(salinityValue), normalRanges.salinity);
    }
  }

  // Update last update time
  const timestamp = data.timestamp || Date.now();
  console.log('Cards updated at:', formatTime(timestamp));
}

/**
 * Highlight normal range on cards
 */
function highlightNormalRange(cardElement, value, range) {
  if (!cardElement) return;

  // Remove existing range classes
  cardElement.classList.remove('normal-range', 'warning-range', 'critical-range');

  // Add appropriate range class
  if (value >= range.min && value <= range.max) {
    cardElement.classList.add('normal-range');
  } else if (value < range.min * 0.8 || value > range.max * 1.2) {
    cardElement.classList.add('critical-range');
  } else {
    cardElement.classList.add('warning-range');
  }
}

/**
 * Update all charts with new data
 */
function updateAllCharts(data) {
  // Generate time label
  const timestamp = data.timestamp || Date.now();
  const timeLabel = formatTime(timestamp);

  // Check for duplicate
  if (!chartData.labels.includes(timeLabel)) {
    // Add new data point to all charts
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

    // Update all charts
    updateChart(tempPhChart, data);
    updateChart(turbidityOxygenChart, data);
    updateChart(salinityChart, data);
    updateChart(sensorChart, data);

    console.log('All charts updated:', timeLabel, 'Data points:', chartData.labels.length);
  }
}

/**
 * Update individual chart
 */
function updateChart(chart, data) {
  if (!chart) return;

  // Add data point to chart
  if (chart.data && chart.data.datasets[0]) {
    chart.data.datasets.forEach((dataset, index) => {
      const value = getChartValue(data, index);
      if (value !== null && value !== undefined) {
        dataset.data.push(parseFloat(value));
      }
    });

    // Limit data points
    if (chart.data.labels.length > maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(dataset => {
        dataset.data.shift();
      });
    }

    // Update chart without animation for better performance
    chart.update('none');
  }
}

/**
 * Get chart value based on dataset index
 */
function getChartValue(data, index) {
  const valueMap = [
    data.temperature,
    data.pH || data.ph,
    data.turbidity,
    data.dissolvedOxygen,
    data.salinity
  ];
  return valueMap[index] || 0;
}

/**
 * Generate complete simulated sensor data with realistic variations
 */
function generateSimulatedData() {
  const now = Date.now();

  // Add time-based variations for more realistic simulation
  const hour = new Date(now).getHours();
  const tempVariation = Math.sin((hour / 24) * Math.PI * 2) * 3;

  return {
    temperature: (22 + tempVariation + Math.random() * 8).toFixed(1),
    pH: (7.0 + Math.random() * 1.5).toFixed(2),
    turbidity: (2.0 + Math.random() * 8).toFixed(2),
    dissolvedOxygen: (6.0 + Math.random() * 6).toFixed(2),
    salinity: (30.0 + Math.random() * 10).toFixed(2),
    timestamp: now
  };
}

/**
 * Handle Firebase errors
 */
function handleError(error) {
  console.error('Firebase error:', error.code, error.message);
  showError('Firebase connection error: ' + error.message);
}

/**
 * Show error message to user
 */
function showError(message) {
  // Create error notification
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    font-size: 0.9rem;
    max-width: 300px;
  `;

  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function cacheMLElements() {
  mlElements.nitrogen = document.getElementById('ml-nitrogen');
  mlElements.ammonia = document.getElementById('ml-ammonia');
  mlElements.lead = document.getElementById('ml-lead');
  mlElements.sodium = document.getElementById('ml-sodium');
}

/**
 * Update ML Estimated Indicators (Simulated)
 */
function updateMLIndicators() {
  // Simulate values based on "analysis" of other sensors
  // Nitrogen (0.1 - 2.0 mg/L)
  if (mlElements.nitrogen) mlElements.nitrogen.textContent = (0.5 + Math.random() * 1.5).toFixed(2);

  // Ammonia (0.01 - 0.5 mg/L)
  if (mlElements.ammonia) mlElements.ammonia.textContent = (0.05 + Math.random() * 0.4).toFixed(3);

  // Lead (0 - 10 µg/L) - mostly low
  if (mlElements.lead) mlElements.lead.textContent = (Math.random() * 5).toFixed(1);

  // Sodium (10 - 100 mg/L)
  if (mlElements.sodium) mlElements.sodium.textContent = (20 + Math.random() * 50).toFixed(1);
}

/**
 * Setup CSV Export Button
 */
function setupCSVExport() {
  const exportBtn = document.getElementById('export-csv-btn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', async () => {
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = 'Generating...';
    exportBtn.disabled = true;

    try {
      if (!firebase.functions) {
        throw new Error('Firebase Functions SDK not loaded');
      }
      const generateCSV = firebase.functions().httpsCallable('generateCSV');
      const result = await generateCSV();

      if (result.data.csv) {
        downloadCSV(result.data.csv, 'bluesentinel_data.csv');
        showError('Export successful! ' + result.data.count + ' records.');
      } else {
        showError('No data available to export.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showError('Export failed: ' + error.message);
    } finally {
      exportBtn.innerHTML = originalText;
      exportBtn.disabled = false;
    }
  });
}

function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
