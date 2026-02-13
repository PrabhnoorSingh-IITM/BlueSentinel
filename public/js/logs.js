// Logs page functionality for V2.0 BlueSentinel Design
document.addEventListener('DOMContentLoaded', function () {
    loadIncidentLogs();
    // Map interactions removed for V2 list view
    // setupLogActions(); // Simpler actions for v2
});

function loadIncidentLogs() {
    // Simulate loading logs from Firebase
    const logsData = [
        {
            time: '12:39am',
            type: 'pH Alert',
            severity: 'alert',
            details: 'pH level dropped to 5.2 - below safe threshold',
            node: 'Node-Alpha-1'
        },
        {
            time: '11:45pm',
            type: 'Temperature',
            severity: 'warning',
            details: 'Water temperature increased to 32°C',
            node: 'Node-Alpha-1'
        },
        {
            time: '10:30pm',
            type: 'Maintenance',
            severity: 'normal',
            details: 'Sensor calibration completed successfully',
            node: 'Cloud-Gateway'
        },
        {
            time: '9:15pm',
            type: 'Turbidity',
            severity: 'alert',
            details: 'Turbidity spike detected (12 NTU)',
            node: 'Node-Beta-2'
        },
        {
            time: '8:00pm',
            type: 'Health Score',
            severity: 'normal',
            details: 'Marine health score improved to 85/100',
            node: 'Kolkata Port'
        }
    ];

    const tbody = document.getElementById('logs-body');
    if (!tbody) return;

    // Clear existing (if any placeholder)
    tbody.innerHTML = '';

    logsData.forEach(log => {
        const row = document.createElement('tr');
        row.className = 'log-row';

        // Severity Badge Styling
        let badgeClass = 'badge-info';
        if (log.severity === 'alert') badgeClass = 'badge-alert';
        if (log.severity === 'warning') badgeClass = 'badge-alert'; // reuse alert style or add warning
        if (log.severity === 'normal') badgeClass = 'badge-info'; // use info for normal/success

        row.innerHTML = `
            <td style="font-family: monospace; color: var(--text-muted);">${log.time}</td>
            <td><span class="badge ${badgeClass}">${log.type}</span></td>
            <td>${log.details}</td>
            <td style="color: var(--color-cyan);">${log.node}</td>
        `;

        tbody.appendChild(row);
    });
}

