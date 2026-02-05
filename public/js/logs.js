// Logs page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadIncidentLogs();
    setupMapInteractions();
    setupLogActions();
    monitorSensorThresholds();
});

const thresholdConfig = {
    temperature: { warning: { min: 10, max: 32 }, alert: { min: 5, max: 35 } },
    pH: { warning: { min: 6.5, max: 8.5 }, alert: { min: 6.0, max: 9.0 } },
    turbidity: { warning: { min: 0, max: 5 }, alert: { min: 0, max: 10 } },
    dissolvedOxygen: { warning: { min: 5, max: 12 }, alert: { min: 3, max: 15 } },
    salinity: { warning: { min: 20, max: 40 }, alert: { min: 15, max: 45 } }
};

const recentAlerts = new Map();

function monitorSensorThresholds() {
    if (!window.firebaseDB) {
        console.warn('Firebase database not available for logs monitoring');
        return;
    }

    window.firebaseDB.ref('BlueSentinel').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        evaluateSensor('temperature', data.temperature, 'Temperature');
        evaluateSensor('pH', data.pH ?? data.ph, 'pH');
        evaluateSensor('turbidity', normalizeTurbidity(data.turbidity ?? data.turbidityRaw ?? data.A0), 'Turbidity');
        evaluateSensor('dissolvedOxygen', data.dissolvedOxygen, 'Dissolved O₂');
        evaluateSensor('salinity', data.salinity, 'Salinity');
    });
}

function evaluateSensor(key, value, label) {
    if (value === undefined || value === null) return;

    const thresholds = thresholdConfig[key];
    const alertKey = `${key}`;
    const now = Date.now();
    const lastTime = recentAlerts.get(alertKey) || 0;

    let severity = null;
    if (value < thresholds.alert.min || value > thresholds.alert.max) {
        severity = 'alert';
    } else if (value < thresholds.warning.min || value > thresholds.warning.max) {
        severity = 'warning';
    }

    if (!severity) return;
    if (now - lastTime < 120000) return;

    recentAlerts.set(alertKey, now);
    createLogEntry({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: label,
        severity,
        location: 'Live Sensor Feed',
        details: `${label} reading out of range: ${value}`,
        timestamp: now
    });
}

function normalizeTurbidity(value) {
    if (value === undefined || value === null || value === '') return null;
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric)) return null;

    if (numeric > 50) {
        const voltage = (numeric / 4095) * 3.3;
        let ntu = -1120.4 * voltage * voltage + 5742.3 * voltage - 4352.9;
        if (Number.isNaN(ntu)) return null;
        ntu = Math.max(0, ntu);
        return parseFloat(ntu.toFixed(2));
    }

    return numeric;
}

function createLogEntry(log) {
    const logsContainer = document.querySelector('.logs-container');
    if (!logsContainer) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${log.severity}`;
    entry.innerHTML = `
        <div class="log-header">
            <span class="log-time">${log.time}</span>
            <span class="log-type ${log.severity}">${log.type}</span>
            <span class="log-location">${log.location}</span>
        </div>
        <div class="log-details">
            <p>${log.details}</p>
            <div class="log-actions">
                <button class="btn-acknowledge">Acknowledge</button>
                ${log.severity !== 'normal' ? '<button class="btn-investigate">Investigate</button>' : ''}
            </div>
        </div>
    `;

    logsContainer.prepend(entry);
    setupLogActions();
    persistLogEntry(log);
}

function persistLogEntry(log) {
    if (!window.firebaseDB) return;

    const entry = {
        time: log.time,
        type: log.type,
        severity: log.severity,
        location: log.location,
        details: log.details,
        timestamp: log.timestamp || Date.now(),
        acknowledged: false
    };

    window.firebaseDB.ref('logs').push(entry).catch(error => {
        console.error('Failed to write log to Firebase:', error);
    });
}

function loadIncidentLogs() {
    if (!window.firebaseDB) {
        console.warn('Firebase database not available for logs');
        return;
    }

    const logsRef = window.firebaseDB.ref('logs').orderByChild('timestamp').limitToLast(50);
    logsRef.on('value', (snapshot) => {
        const logsData = [];
        snapshot.forEach(child => {
            logsData.push({ id: child.key, ...child.val() });
        });

        updateLogEntries(logsData.reverse());
    });
}

function updateLogEntries(logsData) {
    const logsContainer = document.querySelector('.logs-container');
    if (!logsContainer) return;

    logsContainer.innerHTML = '';

    logsData.forEach(log => {
        const entry = document.createElement('div');
        entry.className = `log-entry ${log.severity || 'normal'}`;
        entry.dataset.logId = log.id;
        entry.dataset.acknowledged = log.acknowledged ? 'true' : 'false';

        entry.innerHTML = `
            <div class="log-header">
                <span class="log-time">${log.time || formatLogTime(log.timestamp)}</span>
                <span class="log-type ${log.severity || 'normal'}">${log.type || 'Sensor'}</span>
                <span class="log-location">${log.location || 'Unknown'}</span>
            </div>
            <div class="log-details">
                <p>${log.details || 'No details available'}</p>
                <div class="log-actions">
                    <button class="btn-acknowledge" ${log.acknowledged ? 'disabled style="opacity:0.5;"' : ''}>
                        ${log.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                    ${(log.severity && log.severity !== 'normal') ? '<button class="btn-investigate">Investigate</button>' : ''}
                </div>
            </div>
        `;

        logsContainer.appendChild(entry);
    });

    setupLogActions();
}

function formatLogTime(timestamp) {
    if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function setupMapInteractions() {
    const mapMarkers = document.querySelectorAll('.map-marker');
    
    mapMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const location = this.dataset.location;
            const label = this.querySelector('.marker-label').textContent;
            
            // Show location details (could open a modal or navigate)
            console.log(`Location clicked: ${label} at ${location}`);
            
            // Highlight corresponding log entries
            highlightLocationLogs(label);
        });
    });
}

function highlightLocationLogs(location) {
    const logEntries = document.querySelectorAll('.log-entry');
    
    logEntries.forEach(entry => {
        const locationElement = entry.querySelector('.log-location');
        if (locationElement && locationElement.textContent === location) {
            entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            entry.style.animation = 'pulse 2s';
            setTimeout(() => {
                entry.style.animation = '';
            }, 2000);
        }
    });
}

function setupLogActions() {
    const acknowledgeButtons = document.querySelectorAll('.btn-acknowledge');
    const investigateButtons = document.querySelectorAll('.btn-investigate');
    
    acknowledgeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const logEntry = this.closest('.log-entry');
            const logId = logEntry.dataset.logId;
            
            // Update UI
            this.textContent = 'Acknowledged';
            this.disabled = true;
            this.style.opacity = '0.5';
            logEntry.dataset.acknowledged = 'true';
            
            // Send to Firebase
            acknowledgeLog(logId);
            
            // Show feedback
            showNotification('Log acknowledged successfully', 'success');
        });
    });
    
    investigateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const logEntry = this.closest('.log-entry');
            const logId = logEntry.dataset.logId;
            const location = logEntry.querySelector('.log-location').textContent;
            
            // Navigate to investigation page or show details
            investigateIncident(logId, location);
        });
    });
}

function acknowledgeLog(logId) {
    // Send acknowledgment to Firebase
    if (window.firebaseDB) {
        window.firebaseDB.ref(`logs/${logId}`).update({
            acknowledged: true,
            acknowledgedAt: Date.now(),
            acknowledgedBy: 'current_user' // Replace with actual user ID
        }).catch(error => {
            console.error('Error acknowledging log:', error);
            showNotification('Failed to acknowledge log', 'error');
        });
    } else {
        showNotification('Firebase not connected', 'error');
    }
}

function investigateIncident(logId, location) {
    // Navigate to investigation details or show modal
    showNotification(`Investigating incident at ${location}`, 'info');
    
    // Could navigate to a detailed investigation page
    // window.location.href = `investigate.html?id=${logId}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#44ff44' : type === 'error' ? '#ff4444' : '#ffaa00'};
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// No simulated auto-refresh; logs update via Firebase listeners

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
