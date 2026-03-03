/**
 * dock.js
 * Implements the MacOS-style magnification effect for the floating dock.
 */

document.addEventListener('DOMContentLoaded', () => {
    initDock();
});

function initDock() {
    const dockContainer = document.querySelector('.dock-container');
    const dockItems = document.querySelectorAll('.dock-item');

    if (!dockContainer || dockItems.length === 0) return;

    // Parameters
    const baseWidth = 40; // Base size in px
    const maxScale = 2.0;   // Higher magnification for icons
    const range = 150;    // Distance of effect in px

    dockContainer.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;

        dockItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX - itemCenterX);

            let scale = 1;

            if (distance < range) {
                const normalizedDistance = distance / range;
                const curve = (Math.cos(normalizedDistance * Math.PI) + 1) / 2;
                scale = 1 + (maxScale - 1) * curve;
            }

            // Apply scale to the item dimensions directly
            item.style.width = `${baseWidth * scale}px`;
            item.style.height = `${baseWidth * scale}px`;

            // Adjust icon font size scaling if needed, but resizing container usually handles it
            const icon = item.querySelector('.dock-icon');
            if (icon) {
                // Ensure icon scales nicely within container
                icon.style.fontSize = `${1.2 * scale}rem`;
            }
        });
    });

    dockContainer.addEventListener('mouseleave', () => {
        dockItems.forEach(item => {
            item.style.width = `${baseWidth}px`;
            item.style.height = `${baseWidth}px`;

            const icon = item.querySelector('.dock-icon');
            if (icon) {
                icon.style.fontSize = `1.2rem`;
            }
        });
    });
}
