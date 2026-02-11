// Forums Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeForumsPage();
});

function initializeForumsPage() {
    setupFormValidation();
    setupCardInteractions();
    setupFiltering();
    console.log('Forums page initialized');
}

// Form validation and submission
function setupFormValidation() {
    const form = document.querySelector('.initiative-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Validation rules
    const validationRules = {
        'org-name': value.length >= 2,
        'org-type': value !== '',
        'initiative-title': value.length >= 5,
        'initiative-status': value !== '',
        'initiative-desc': value.length >= 20,
        'contact-email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        'website': !value || /^https?:\/\/.+\..+/.test(value)
    };

    isValid = validationRules[fieldName] !== false;

    if (!isValid) {
        errorMessage = getErrorMessage(fieldName, value);
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

function getErrorMessage(fieldName, value) {
    const errorMessages = {
        'org-name': 'Organization name must be at least 2 characters',
        'org-type': 'Please select an organization type',
        'initiative-title': 'Initiative title must be at least 5 characters',
        'initiative-status': 'Please select a status',
        'initiative-desc': 'Description must be at least 20 characters',
        'contact-email': 'Please enter a valid email address',
        'website': 'Please enter a valid website URL'
    };

    return errorMessages[fieldName] || 'This field is required';
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.5rem';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all fields
    let isFormValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (isFormValid) {
        submitInitiative(formData);
    } else {
        showNotification('Please correct the errors before submitting', 'error');
    }
}

function submitInitiative(formData) {
    // In a real implementation, this would send data to a backend
    // For demo purposes, we'll show a success message
    console.log('Initiative submitted:', Object.fromEntries(formData));
    
    showNotification('Initiative submitted successfully! We will review and feature it soon.', 'success');
    
    // Reset form
    document.querySelector('.initiative-form').reset();
}

// Card interactions
function setupCardInteractions() {
    const cards = document.querySelectorAll('.initiative-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            const org = this.querySelector('.initiative-org').textContent;
            showInitiativeDetails(title, org);
        });
    });
}

function showInitiativeDetails(title, organization) {
    // Create modal or expand details
    console.log(`Showing details for ${title} by ${organization}`);
    // Implementation would show detailed view in a modal
}

// Filtering functionality
function setupFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.initiative-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterInitiatives(filter, cards);
        });
    });
}

function filterInitiatives(filter, cards) {
    cards.forEach(card => {
        const status = card.querySelector('.initiative-status').textContent.toLowerCase();
        const type = card.dataset.type || 'all';
        
        if (filter === 'all' || status.includes(filter) || type.includes(filter)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1000',
        fontSize: '0.95rem',
        fontWeight: '500',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS for error states
const errorStyles = `
    .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2) !important;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }
    
    .notification {
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);
