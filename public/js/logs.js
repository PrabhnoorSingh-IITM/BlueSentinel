// Logs page functionality for V2.1 BlueSentinel Design
document.addEventListener('DOMContentLoaded', function () {
    const logs = loadIncidentLogs();
    try {
        initMap(logs);
    } catch (e) {
        console.error("Map initialization failed:", e);
    }
});

function loadIncidentLogs() {
    // Simulate loading logs with LOCATION DATA
    const logsData = [
        {
            time: '12:39am',
            type: 'pH Alert',
            severity: 'alert',
            details: 'pH level dropped to 5.2 - below safe threshold',
            node: 'Node-Alpha-1',
            lat: 12.9716, lng: 77.5946 // Bangalore (Example)
        },
        {
            time: '11:45pm',
            type: 'Temperature',
            severity: 'warning',
            details: 'Water temperature increased to 32°C',
            node: 'Coastal-Beta',
            lat: 13.0827, lng: 80.2707 // Chennai
        },
        {
            time: '10:30pm',
            type: 'Maintenance',
            severity: 'normal',
            details: 'Sensor calibration completed successfully',
            node: 'Cloud-Gateway',
            lat: 19.0760, lng: 72.8777 // Mumbai
        },
        {
            time: '9:15pm',
            type: 'Turbidity',
            severity: 'alert',
            details: 'Turbidity spike detected (12 NTU)',
            node: 'River-Delta-Z',
            lat: 22.5726, lng: 88.3639 // Kolkata
        },
        {
            time: '8:00pm',
            type: 'Health Score',
            severity: 'normal',
            details: 'Marine health score improved to 85/100',
            node: 'Port-Blair-Station',
            lat: 11.6234, lng: 92.7265 // Port Blair
        }
    ];

    const tbody = document.getElementById('logs-body');
    if (!tbody) return logsData;

    // Clear existing
    tbody.innerHTML = '';

    logsData.forEach(log => {
        const row = document.createElement('tr');
        row.className = 'log-row';

        // Severity Badge Styling
        let badgeClass = 'badge-info';
        if (log.severity === 'alert') badgeClass = 'badge-alert';
        if (log.severity === 'warning') badgeClass = 'badge-warning';
        if (log.severity === 'normal') badgeClass = 'badge-info';

        row.innerHTML = `
            <td style="font-family: monospace; color: var(--text-muted);">${log.time}</td>
            <td><span class="badge ${badgeClass}">${log.type}</span></td>
            <td>${log.details}</td>
            <td style="color: var(--color-cyan);">${log.node}</td>
        `;

        tbody.appendChild(row);
    });

    return logsData;
}

// --- 3D GLOBE INITIALIZATION (Replacing Leaflet) ---
let world; // Globe instance

function initMap() {
    const mapContainer = document.getElementById('logs-map');
    if (!mapContainer) return;

    // Use Sample Markers from user request + our logs
    const sampleMarkers = [
        { lat: 40.7128, lng: -74.006, label: "New York", type: 'normal' },
        { lat: 51.5074, lng: -0.1278, label: "London", type: 'warning' }, // varied types for demo
        { lat: 35.6762, lng: 139.6503, label: "Tokyo", type: 'normal' },
        { lat: -33.8688, lng: 151.2093, label: "Sydney", type: 'alert' },
        { lat: 48.8566, lng: 2.3522, label: "Paris", type: 'normal' },
        { lat: 28.6139, lng: 77.209, label: "New Delhi", type: 'warning' },
        { lat: 55.7558, lng: 37.6173, label: "Moscow", type: 'normal' },
        { lat: -22.9068, lng: -43.1729, label: "Rio de Janeiro", type: 'normal' },
        { lat: 31.2304, lng: 121.4737, label: "Shanghai", type: 'alert' },
        { lat: 25.2048, lng: 55.2708, label: "Dubai", type: 'normal' },
        { lat: -34.6037, lng: -58.3816, label: "Buenos Aires", type: 'normal' },
        { lat: 1.3521, lng: 103.8198, label: "Singapore", type: 'normal' },
        { lat: 37.5665, lng: 126.978, label: "Seoul", type: 'normal' },
    ];

    // Combine with logsData if any have unique locations, or just use these for visual style
    const allMarkers = [...sampleMarkers];

    world = Globe()
        (mapContainer)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#4da6ff')
        .atmosphereAltitude(0.2) // increased for visibility
        .autoRotate(true)
        .autoRotateSpeed(0.5)
        .width(mapContainer.clientWidth)
        .height(mapContainer.clientHeight || 500)

        // Custom Html Markers (Rings/Dots)
        .htmlElementsData(allMarkers)
        .htmlLat(d => d.lat)
        .htmlLng(d => d.lng)
        .htmlElement(d => {
            const el = document.createElement('div');
            // Style based on type
            let color = 'cyan';
            if (d.type === 'warning') color = '#FFD600';
            if (d.type === 'alert') color = '#FF4D4D';

            el.innerHTML = `
                <div style="
                    width: 10px; 
                    height: 10px; 
                    background: ${color}; 
                    border-radius: 50%; 
                    box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
                    cursor: pointer;
                "></div>
                <div style="
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    color: white;
                    font-size: 10px;
                    white-space: nowrap;
                    text-shadow: 0 2px 4px black;
                    opacity: 0.8;
                    margin-top: 4px;
                    font-family: var(--font-main);
                ">${d.label}</div>
            `;

            el.addEventListener('click', () => {
                showLogDetails({
                    type: d.type || 'Info',
                    timestamp: Date.now(),
                    details: `${d.label} Station Report`
                });
                // Rotate to view
                world.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.5 }, 1000);
            });

            return el;
        });

    // CENTER THE GLOBE - Force initial point of view
    // Altitude > 1.0 means zoomed out enough to see the curve
    world.pointOfView({ lat: 45, lng: 0, altitude: 1.8 });

    // Adjust on resize
    function onResize() {
        if (mapContainer) {
            world.width(mapContainer.clientWidth);
            world.height(mapContainer.clientHeight || 500);
        }
    }
    window.addEventListener('resize', onResize);

    // Correction for initial render if container size changes
    setTimeout(() => {
        onResize();
        world.pointOfView({ lat: 45, lng: 0, altitude: 1.8 });
    }, 500);
}

// Placeholder for showLogDetails function, as it's called in the new initMap
function showLogDetails(log) {
    console.log("Log details clicked:", log);
    // Implement actual display logic here, e.g., open a modal or update a sidebar
    alert(`Log Type: ${log.type}\nDetails: ${log.details}`);
}

// Function to refresh markers (Not needed as much for static demo points, but kept for compatibility)
function refreshMapMarkers() {
    // If we were adding dynamic markers via API, we would update world.htmlElementsData() here.
    // tailored to keep the visual "Cool" factor of fixed major cities + dynamic logs.
    console.log("Refreshing 3D Globe data...");
}
