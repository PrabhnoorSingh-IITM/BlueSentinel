/**
 * Forums Page Feature Logic
 * Handles interactive elements for the community reporting system.
 */

document.addEventListener('DOMContentLoaded', () => {
    const newReportBtn = document.getElementById('new-report-btn');
    const reportForm = document.getElementById('report-form-container');

    if (newReportBtn && reportForm) {
        newReportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Toggle visibility using display style or a class
            const isHidden = window.getComputedStyle(reportForm).display === 'none';
            reportForm.style.display = isHidden ? 'block' : 'none';
        });
    }

    // Optional: Add form submission handling
    const forumForm = document.querySelector('.forum-form');
    if (forumForm) {
        forumForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Your report has been submitted to the community! (Simulated)');
            reportForm.style.display = 'none';
            forumForm.reset();
        });
    }
});
