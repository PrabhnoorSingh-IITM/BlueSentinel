// Logs page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadIncidentLogs();
    setupMapInteractions();
    setupLogActions();
});

function loadIncidentLogs() {
    // Simulate loading logs from Firebase
    const logsData = [
        {
            id: 1,
            time: '12:39am',
            type: 'pH Alert',
            severity: 'alert',
            location: 'Mumbai Bay',
            details: 'pH level dropped to 5.2 - below safe threshold',
            timestamp: Date.now() - 3600000,
            acknowledged: false
        },
        {
            id: 2,
            time: '11:45pm',
            type: 'Temperature',
            severity: 'warning',
            location: 'Bangalore Lake',
            details: 'Water temperature increased to 32°C - above optimal range',
            timestamp: Date.now() - 7200000,
            acknowledged: false
        },
        {
            id: 3,
            time: '10:30pm',
            type: 'Maintenance',
            severity: 'normal',
            location: 'Delhi River',
            details: 'Sensor calibration completed successfully',
            timestamp: Date.now() - 10800000,
            acknowledged: true
        },
        {
            id: 4,
            time: '9:15pm',
            type: 'Turbidity',
            severity: 'alert',
            location: 'Chennai Coast',
            details: 'Turbidity spike detected - possible sediment runoff',
            timestamp: Date.now() - 14400000,
            acknowledged: false
        },
        {
            id: 5,
            time: '8:00pm',
            type: 'Health Score',
            severity: 'normal',
            location: 'Kolkata Port',
            details: 'Marine health score improved to 85/100',
            timestamp: Date.now() - 18000000,
            acknowledged: true
        }
    ];

    updateLogEntries(logsData);
}

function updateLogEntries(logsData) {
    const logEntries = document.querySelectorAll('.log-entry');
    
    logEntries.forEach((entry, index) => {
        if (logsData[index]) {
            const log = logsData[index];
            const timeElement = entry.querySelector('.log-time');
            const typeElement = entry.querySelector('.log-type');
            const locationElement = entry.querySelector('.log-location');
            const detailsElement = entry.querySelector('.log-details p');
            
            if (timeElement) timeElement.textContent = log.time;
            if (typeElement) typeElement.textContent = log.type;
            if (locationElement) locationElement.textContent = log.location;
            if (detailsElement) detailsElement.textContent = log.details;
            
            // Store log data for actions
            entry.dataset.logId = log.id;
            entry.dataset.acknowledged = log.acknowledged;
            
            // Update button states if acknowledged
            if (log.acknowledged) {
                const acknowledgeBtn = entry.querySelector('.btn-acknowledge');
                if (acknowledgeBtn) {
                    acknowledgeBtn.textContent = 'Acknowledged';
                    acknowledgeBtn.disabled = true;
                    acknowledgeBtn.style.opacity = '0.5';
                }
            }
        }
    });
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
        });
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

// Auto-refresh logs every 30 seconds
setInterval(() => {
    loadIncidentLogs();
}, 30000);

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
