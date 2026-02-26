// Enhanced Dashboard with Separate Graphs and Normal Range Highlighting
// V2.0 BlueSentinel Design Compatible

// Chart variables
let sensorChart = null;
let salinityChart = null; // Removed


const maxDataPoints = 30;
const chartData = {
  ph: [],
  turbidity: [],
  dissolvedOxygen: [],
  labels: [],
  temperature: [],
  ph: [],
  turbidity: [],
  projection: [], // For AI chart
  trainingBaseline: [] // For AI chart context
};

// Store last values for card updates
const lastValues = {
  temperature: '--',
  ph: '--',
  turbidity: '--',
  dissolvedOxygen: '--'
};

// Store DOM element references
const cardElements = {
  temperature: null,
  ph: null,
  turbidity: null,
  dissolvedOxygen: null
};

const mlElements = {
  nitrogen: null,
  ammonia: null,
  lead: null,
  sodium: null
};

// Simulation state
let isSimulationMode = false;
let lastSimValues = {
  temperature: 25.0,
  pH: 7.0,
  turbidity: 3.5,
  dissolvedOxygen: 7.5
};

function linearRegression(y) {
  const n = y.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += y[i];
    sumXY += i * y[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Firebase reference
let db = null;
let sensorLatestRef = null;

// Normal ranges for highlighting
const normalRanges = {
  temperature: { min: 20, max: 30, unit: '°C' },
  ph: { min: 6.5, max: 8.5, unit: 'pH' },
  turbidity: { min: 0, max: 5, unit: 'NTU' },
  dissolvedOxygen: { min: 6, max: 8, unit: 'mg/L' }
};

// Initialize when document is loaded
window.addEventListener('load', function () {
  cacheDOMElements();

  // Setup CSV Export
  setupCSVExport();

  // Check Firebase
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    showError('Firebase SDK failed to load. Using simulation.');
    startSimulationMode();
    return;
  }

  try {
    db = firebase.database();
    console.log('Firebase database initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    showError('Firebase init failed. Using simulation.');
    startSimulationMode();
    return;
  }

  initializeCharts();
  initializeDashboard();

  // Fallback timeout removed to ensure we wait for real DB data
  setTimeout(() => {
    // Force Analysis Check after 4 seconds regardless of real data presence
    if (!window.hasInitialAnalysis && window.getWaterHealthAnalysis) {
      console.log("Forcing initial analysis check...");
      refreshAnalysis(lastValues);
    }
  }, 4000);
});

function cacheDOMElements() {
  cardElements.temperature = document.getElementById('temp-value');
  cardElements.ph = document.getElementById('ph-value');
  cardElements.turbidity = document.getElementById('turbidity-value');
  cardElements.dissolvedOxygen = document.getElementById('do-value');

  mlElements.nitrogen = document.getElementById('ml-nitrogen');
  mlElements.ammonia = document.getElementById('ml-ammonia');
  mlElements.lead = document.getElementById('ml-lead');
  mlElements.sodium = document.getElementById('ml-sodium');
}

function initializeCharts() {
  initializeTempChart();
  initializePhChart();
  initializeTurbidityChart();
  initializeDOChart();
  initializeAIProjectionChart();
}

function initializeDOChart() {
  const ctx = document.getElementById('do-chart');
  if (!ctx) return;
  window.doChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'DO (mg/L)',
        data: chartData.dissolvedOxygen,
        borderColor: '#00D4FF',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(0, 212, 255, 0.1)'
      }]
    },
    options: createChartOptions()
  });
}

function initializeTempChart() {
  const ctx = document.getElementById('temp-chart');
  if (!ctx) return;
  window.tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Temp (°C)',
        data: chartData.temperature,
        borderColor: '#FF4D4D',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(255, 77, 77, 0.1)'
      }]
    },
    options: createChartOptions()
  });
}

function initializePhChart() {
  const ctx = document.getElementById('ph-chart');
  if (!ctx) return;
  window.phChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'pH',
        data: chartData.ph,
        borderColor: '#00F0FF',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(0, 240, 255, 0.1)'
      }]
    },
    options: createChartOptions()
  });
}

function initializeTurbidityChart() {
  const ctx = document.getElementById('turbidity-chart');
  if (!ctx) return;
  window.turbidityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Turbidity (NTU)',
        data: chartData.turbidity,
        borderColor: '#FFD600',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(255, 214, 0, 0.1)'
      }]
    },
    options: createChartOptions()
  });
}

function initializeAIProjectionChart() {
  const ctx = document.getElementById('ai-projection-chart');
  if (!ctx) return;

  // Gradient for "Safe Zone" simulation
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 255, 157, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 255, 157, 0)');

  window.aiChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Live Quality Index',
          data: chartData.projection, // We'll map PH/Turbidity to a score
          borderColor: '#FFFFFF',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'ML Safe Baseline',
          data: chartData.trainingBaseline,
          borderColor: 'transparent',
          backgroundColor: gradient,
          fill: true,
          pointRadius: 0
        },
        {
          label: 'AI Projection (Future)',
          data: [], // Populated dynamically
          borderColor: '#7000FF',
          borderDash: [5, 5],
          borderWidth: 2,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94A3B8' } },
        annotation: {
          annotations: {
            box1: {
              type: 'box',
              yMin: 6.5,
              yMax: 8.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'transparent'
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748B' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B' }, min: 0, max: 100 }
      }
    }
  });
}

function createChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false } // Sparkline style
    },
    elements: { point: { radius: 0 } }
  };
}

// Old charts removed


// Redundant charts removed


function initializeDashboard() {
  try {
    sensorLatestRef = db.ref('BlueSentinel');
    sensorLatestRef.on('value', handleLatestData, handleError);
    console.log('Firebase listeners initialized');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Initialization failed. Using simulation.');
    startSimulationMode();
  }
}

function handleLatestData(snapshot) {
  const data = snapshot.val();

  if (data) {
    // Determine if data has valid keys (Temp, pH, Turbidity)
    const hasRealData = data.temperature !== undefined || data.temp !== undefined || data.pH !== undefined || data.ph !== undefined || data.turbidity !== undefined || data.turb !== undefined;

    let enrichedData;
    if (hasRealData) {
      console.log("Real-time data received from BlueSentinel Grid");

      // Use exact DB values, fallback to last known good values
      enrichedData = {
        temperature: parseFloat(data.temperature || data.temp || data.t || lastSimValues.temperature).toFixed(1),
        pH: parseFloat(data.pH || data.ph || lastSimValues.pH).toFixed(2),
        turbidity: parseFloat(data.turbidity || data.turb || data.ntu || lastSimValues.turbidity).toFixed(2),
        dissolvedOxygen: parseFloat(data.dissolvedOxygen || data.do || lastSimValues.dissolvedOxygen).toFixed(2),
        timestamp: data.timestamp || Date.now()
      };

      // Update our base so it sticks to reality
      lastSimValues.temperature = parseFloat(enrichedData.temperature);
      lastSimValues.pH = parseFloat(enrichedData.pH);
      lastSimValues.turbidity = parseFloat(enrichedData.turbidity);
      lastSimValues.dissolvedOxygen = parseFloat(enrichedData.dissolvedOxygen);

    } else {
      console.log("No real data detected, using synthetic simulation.");
      enrichedData = generateSimulatedData();

      const connStatus = document.getElementById('connection-status');
      if (connStatus) {
        connStatus.innerHTML = '<span>Simulation</span>';
        connStatus.className = 'status-pill status-warning';
      }
    }

    if (hasRealData) {
      const connStatus = document.getElementById('connection-status');
      if (connStatus) {
        connStatus.innerHTML = '<span class="pulse-dot"></span><span>Live Grid</span>';
        connStatus.className = 'status-pill status-normal';
      }
    }

    updateSensorCards(enrichedData);
    updateMLIndicators();
    updateAllCharts(enrichedData);
  } else {
    // No data yet
    const sim = generateSimulatedData();
    updateSensorCards(sim);
    updateMLIndicators();
    updateAllCharts(sim);
  }
}

function updateSensorCards(data) {
  updateCard(cardElements.temperature, data.temperature, normalRanges.temperature, 'temperature', 1);
  updateCard(cardElements.ph, (data.pH || data.ph), normalRanges.ph, 'ph', 2);
  updateCard(cardElements.turbidity, data.turbidity, normalRanges.turbidity, 'turbidity', 2);
  updateCard(cardElements.dissolvedOxygen, data.dissolvedOxygen, normalRanges.dissolvedOxygen, 'dissolvedOxygen', 2);

  // Salinity card replaced by Analysis

  // Trigger Analysis Update (Throttled or on manual refresh)
  // We won't call it every data update to save API quota.
  // Instead, we assume a separate timer or button handles it, OR we call it once on load/first-data.
  if (!window.hasInitialAnalysis && window.getWaterHealthAnalysis) {
    refreshAnalysis(data);
    // window.hasInitialAnalysis = true; // Moved inside function
  }
}

// Store latest AI treatments
window.latestTreatments = {};

async function refreshAnalysis(data) {
  const textEl = document.getElementById('analysis-text');
  const loadingEl = document.getElementById('analysis-loading');
  if (!textEl || !loadingEl) return;

  textEl.style.display = 'none';
  loadingEl.style.display = 'block';

  // Prevent multiple double-calls
  window.hasInitialAnalysis = true;

  if (window.getWaterHealthAnalysis) {
    try {
      // Gather both display values and ML placeholder values for the prompt
      const fullData = {
        ...data,
        nitrogen: mlElements.nitrogen ? mlElements.nitrogen.textContent : 'N/A',
        ammonia: mlElements.ammonia ? mlElements.ammonia.textContent : 'N/A',
        lead: mlElements.lead ? mlElements.lead.textContent : 'N/A',
        sodium: mlElements.sodium ? mlElements.sodium.textContent : 'N/A'
      };

      const result = await window.getWaterHealthAnalysis(fullData);

      // Store dynamic treatments
      window.latestTreatments = result.treatments || {};

      // Update Analysis Text
      textEl.textContent = result.analysis;

      // Update Analysis Status Pill
      const statusEl = document.getElementById('analysis-status');
      if (result.status) {
        statusEl.textContent = result.status;
        if (result.status === 'Critical') statusEl.className = 'status-pill status-danger';
        else if (result.status === 'Warning') statusEl.className = 'status-pill status-warning';
        else statusEl.className = 'status-pill status-normal';
      }

      // Update Water Health Index (Dynamic from Gemini)
      const scoreEl = document.getElementById('water-health-score');
      const healthStatusEl = document.getElementById('water-health-status');
      if (scoreEl && healthStatusEl) {
        scoreEl.textContent = `${result.score}/100`;
        healthStatusEl.textContent = result.status || 'Unknown';

        if (result.score >= 80) {
          healthStatusEl.className = 'status-pill status-success';
          scoreEl.style.color = 'var(--color-success)';
        } else if (result.score >= 50) {
          healthStatusEl.className = 'status-pill status-warning';
          scoreEl.style.color = 'var(--color-warning)';
        } else {
          healthStatusEl.className = 'status-pill status-danger';
          scoreEl.style.color = 'var(--color-danger)';
        }
      }

    } catch (err) {
      console.error("Dashboard Analysis Error:", err);
      textEl.textContent = "Analysis failed to load. Checking connection...";
    }
  }

  loadingEl.style.display = 'none';
  textEl.style.display = 'block';
}

// bind refresh button
document.addEventListener('click', (e) => {
  if (e.target && e.target.closest('#refresh-analysis-btn')) {
    let currentData = {
      temperature: lastValues.temperature,
      pH: lastValues.ph,
      turbidity: lastValues.turbidity,
      dissolvedOxygen: lastValues.dissolvedOxygen
    };
    refreshAnalysis(currentData);
  }
});

function updateCard(element, value, range, key, decimals) {
  if (!element || value === undefined) return;
  const val = parseFloat(value).toFixed(decimals);
  element.textContent = val;
  lastValues[key] = val; // store for reference if needed

  const card = element.closest('.bento-card') || element.closest('.box');
  if (card) {
    highlightNormalRange(card, parseFloat(val), range);
  }
}

function highlightNormalRange(cardElement, value, range) {
  // Reset classes
  const pill = cardElement.querySelector('.status-pill');
  if (!pill) return;

  // Clear previous solution buttons if any (optimization)
  const existingBtn = cardElement.querySelector('.solution-btn');
  if (existingBtn) existingBtn.remove();

  if (value >= range.min && value <= range.max) {
    pill.className = 'status-pill status-normal';
    pill.textContent = 'Normal';
  } else {
    // Out of range logic
    const isCritical = (value < range.min * 0.8 || value > range.max * 1.2);
    pill.className = isCritical ? 'status-pill status-danger' : 'status-pill status-warning';
    pill.textContent = isCritical ? 'Critical' : 'Warning';

    // Inject Solution Button/Link if critical/warning
    // We append it to the value-display or card-header to keep it visible
    const container = cardElement.querySelector('.value-display');
    if (container) {
      const solutionBtn = document.createElement('div');
      solutionBtn.className = 'solution-btn';
      solutionBtn.style.fontSize = '0.75rem';
      solutionBtn.style.marginTop = '0.5rem';
      solutionBtn.style.color = '#FFD600';
      solutionBtn.style.cursor = 'pointer';
      solutionBtn.style.display = 'flex';
      solutionBtn.style.alignItems = 'center';
      solutionBtn.style.gap = '0.25rem';

      solutionBtn.innerHTML = `
            <span style="border-bottom: 1px dotted currentColor">View Solution</span>
            <span style="font-size: 1.2em">›</span>
          `;

      // Interaction: simple alert for now, or trigger chatbot
      solutionBtn.onclick = (e) => {
        e.stopPropagation();
        openSolution(cardElement, value, range);
      };

      container.appendChild(solutionBtn);
    }
  }
}

function openSolution(cardElement, value, range) {
  const metric = cardElement.querySelector('.card-title').textContent;
  const isHigh = value > range.max;

  let advice = "";

  // 1. Try Dynamic AI Advice first
  // Map UI titles to JSON keys
  let aiKey = null;
  if (metric.includes("Temperature")) aiKey = "Temperature";
  else if (metric.includes("pH")) aiKey = "pH";
  else if (metric.includes("Oxygen")) aiKey = "Dissolved Oxygen"; // Key from AI prompt
  else if (metric.includes("Turbidity")) aiKey = "Turbidity";

  if (aiKey && window.latestTreatments && window.latestTreatments[aiKey]) {
    advice = window.latestTreatments[aiKey];
    console.log("Using AI Advice for " + aiKey);
  } else {
    // 2. Fallback to Hardcoded Logic
    if (metric.includes("Temperature")) {
      advice = isHigh ? "Cooling system required. Check for thermal pollution or effluent discharge." : "Water too cold. Check for deep water upwelling.";
    } else if (metric.includes("pH")) {
      advice = isHigh ? "High Alkalinity. Add organic acids or reduce aeration." : "High Acidity. Add buffering agents (sodium carbonate) immediately.";
    } else if (metric.includes("Turbidity")) {
      advice = "High Turbidity. Inspect for soil erosion, runoff, or algal bloom. Deploy settlement tanks.";
    } else if (metric.includes("Oxygen")) {
      advice = "Low Oxygen (Hypoxia). Activate emergency aeration systems and check bio-filters.";
    } else {
      advice = "Sensor reading out of range. Calibrate sensor and check connections.";
    }
  }

  // Trigger Chatbot with this specific advice
  const toggler = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const messageContainer = document.getElementById('chatbot-messages');

  if (chatWindow.style.display === 'none') {
    chatWindow.style.display = 'flex'; // Open chatbot
  }

  // Inject solution into chat
  const div = document.createElement('div');
  div.className = 'ai-message';
  div.style.borderLeft = '3px solid var(--color-warning)';
  div.innerHTML = `<strong>${metric} Alert (${value}):</strong><br>${advice}`;
  messageContainer.appendChild(div);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function updateAllCharts(data) {
  const timestamp = data.timestamp || Date.now();
  // Include seconds to allow updates every 2s as data arrives
  const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // If this exact second already exists, skip (debounce for near-simultaneous triggers)
  if (chartData.labels[chartData.labels.length - 1] === timeLabel) return;

  chartData.labels.push(timeLabel);
  chartData.temperature.push(parseFloat(data.temperature) || 0);
  chartData.ph.push(parseFloat(data.pH || data.ph) || 7);
  // Fixed double ph push bug found in previous code
  chartData.turbidity.push(parseFloat(data.turbidity) || 0);
  chartData.dissolvedOxygen.push(parseFloat(data.dissolvedOxygen) || 0);

  // Simulate Quality Index (0-100) based on potable ranges
  // Ideal: pH 7, Turbidity < 5
  let score = 100;
  score -= Math.abs((data.pH || 7) - 7) * 10; // pH penalty
  let turb = data.turbidity || 0;
  if (turb >= 50) score -= 40; // Very dirty, chaos
  else if (turb >= 5) score -= 20; // Slightly muddy
  else if (turb >= 1) score -= 5; // Acceptable
  // 0-1 is ultra clear, 0 penalty

  score = Math.max(0, Math.min(100, score));

  chartData.projection.push(score);
  chartData.trainingBaseline.push(90 + Math.random() * 5); // Randomized "Perfect" baseline from training data

  if (chartData.labels.length > maxDataPoints) {
    chartData.labels.shift();
    chartData.temperature.shift();
    chartData.ph.shift();
    chartData.turbidity.shift();
    chartData.dissolvedOxygen.shift();
    chartData.projection.shift();
    chartData.trainingBaseline.shift();
  }

  if (window.tempChart) window.tempChart.update('none');
  if (window.phChart) window.phChart.update('none');
  if (window.turbidityChart) window.turbidityChart.update('none');
  if (window.doChart) window.doChart.update('none');

  if (window.aiChart) {
    // Update Prediction Line (Future)
    // Linear Regression based on history
    const pastScores = chartData.projection;
    const { slope, intercept } = linearRegression(pastScores);

    const lastScore = pastScores[pastScores.length - 1] || 100;
    const predictedData = [];
    // Fill nulls for past
    for (let i = 0; i < chartData.labels.length - 1; i++) predictedData.push(null);
    predictedData.push(lastScore);

    const startIdx = pastScores.length - 1;
    for (let i = 1; i <= 10; i++) {
      let p = slope * (startIdx + i) + intercept;
      // Add a tiny bit of noise, but trend follows LR
      predictedData.push(Math.max(0, Math.min(100, p + (Math.random() - 0.5) * 1.5)));
    }

    window.aiChart.data.datasets[2].data = predictedData;
    window.aiChart.update('none');
  }
}

function updateMLIndicators() {
  if (mlElements.nitrogen) mlElements.nitrogen.textContent = (0.5 + Math.random() * 1.5).toFixed(2);
  if (mlElements.ammonia) mlElements.ammonia.textContent = (0.05 + Math.random() * 0.4).toFixed(3);
  if (mlElements.lead) mlElements.lead.textContent = (Math.random() * 5).toFixed(1);
  if (mlElements.sodium) mlElements.sodium.textContent = (20 + Math.random() * 50).toFixed(1);
}

function startSimulationMode() {
  if (isSimulationMode) return;
  isSimulationMode = true;
  console.log('Starting simulation mode');

  setInterval(() => {
    const data = generateSimulatedData();
    updateSensorCards(data);
    updateMLIndicators();
    updateAllCharts(data);
  }, 3000);
}

function generateSimulatedData() {
  return {
    temperature: Math.max(15, Math.min(35, lastSimValues.temperature += (Math.random() - 0.5) * 0.5)).toFixed(1),
    pH: Math.max(6.0, Math.min(8.5, lastSimValues.pH += (Math.random() - 0.5) * 0.1)).toFixed(2),
    turbidity: Math.max(0.0, Math.min(10.0, lastSimValues.turbidity += (Math.random() - 0.5) * 0.5)).toFixed(2),
    dissolvedOxygen: Math.max(4.0, Math.min(10.0, lastSimValues.dissolvedOxygen += (Math.random() - 0.5) * 0.2)).toFixed(2),
    timestamp: Date.now()
  };
}

function handleError(error) {
  console.error('Firebase error:', error);
  if (!isSimulationMode) startSimulationMode();
}

function showError(msg) {
  console.warn(msg);
  // Optional: UI toast
}

function setupCSVExport() {
  const btn = document.getElementById('export-csv-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const headers = ['Timestamp', 'Temperature (°C)', 'pH', 'Turbidity (NTU)', 'DO (mg/L)'];
    const rows = [];

    // Use chartData which stores history
    for (let i = 0; i < chartData.labels.length; i++) {
      rows.push([
        chartData.labels[i],
        chartData.temperature[i],
        chartData.ph[i],
        chartData.turbidity[i],
        chartData.dissolvedOxygen[i]
      ]);
    }

    if (rows.length === 0) {
      alert("No data to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `BlueSentinel_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
