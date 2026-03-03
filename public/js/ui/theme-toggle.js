document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }
});

function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Remove both possibilities to be safe
    toggleBtn.classList.remove('uil-brightness', 'uil-moon');

    if (theme === 'dark') {
        // Dark mode active -> Show Sun (Brightness) to switch to light
        toggleBtn.classList.add('uil-brightness');
    } else {
        // Light mode active -> Show Moon to switch to dark
        toggleBtn.classList.add('uil-moon');
    }
}