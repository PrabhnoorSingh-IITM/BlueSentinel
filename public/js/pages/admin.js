// Administrative Command Center Logic
document.addEventListener('DOMContentLoaded', () => {
    const nodeList = document.getElementById('node-list');

    // Initialize Admin Stream
    initAdminMonitor();

    function initAdminMonitor() {
        if (!nodeList) return;

        // Simulate reading from 'nodes' DB
        const db = firebase.database();
        db.ref('sensors/latest').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                renderNodeStatus(data);
            }
        });
    }

    function renderNodeStatus(data) {
        // High-fidelity node status display
        nodeList.innerHTML = `
            <div class="admin-node-item glass">
                <div class="node-meta">
                    <span class="node-id">Sentinel-Primary</span>
                    <span class="status-indicator online">Online</span>
                </div>
                <div class="node-telemetry">
                    <span>${data.ph || '--'} pH</span>
                    <span>${data.temperature || '--'}°C</span>
                    <span>${data.turbidity || '--'} NTU</span>
                </div>
            </div>
        `;
    }
});
