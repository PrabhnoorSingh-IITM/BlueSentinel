document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
    updateLogoVisibility(theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
            updateLogoVisibility(newTheme);
        });
    }

    // Also allow logo click to toggle theme
    const themeLogo = document.getElementById('themeLogo');
    if (themeLogo) {
        themeLogo.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
            updateLogoVisibility(newTheme);
        });
    }
});

function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    if (theme === 'dark') {
        // Sun icon for switching to light
        toggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    } else {
        // Moon icon for switching to dark
        toggleBtn.innerHTML = `
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    }
}
function updateLogoVisibility(theme) {
    const themeLogo = document.getElementById('themeLogo');
    if (!themeLogo) return;

    if (theme === 'dark') {
        // Show logo in dark mode
        themeLogo.style.opacity = '0.9';
        themeLogo.style.filter = 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.35))';
    } else {
        // Show logo in light mode with adjusted styling
        themeLogo.style.opacity = '0.8';
        themeLogo.style.filter = 'drop-shadow(0 0 4px rgba(0, 100, 150, 0.25))';
    }
}