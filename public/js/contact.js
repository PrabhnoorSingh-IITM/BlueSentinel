// Contact page interactions and animations
document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.team-member, .tech-category, .ref-category, .contact-card, .arch-box, .flow-step'
    );
    animateElements.forEach(el => observer.observe(el));

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
            btn.disabled = true;

            // Push to Firebase
            if (window.firebaseDB) {
                const newMsgRef = window.firebaseDB.ref('messages').push();
                newMsgRef.set({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    read: false
                }).then(() => {
                    // Success UI
                    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Sent!';
                    btn.style.background = 'var(--color-success, #00ff9d)';
                    btn.style.color = '#000';
                    btn.disabled = false;

                    setTimeout(() => {
                        alert('Message received! We will get back to you at ' + email);
                        contactForm.reset();
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1000);
                }).catch((error) => {
                    console.error("Error sending message: ", error);
                    btn.innerHTML = 'Error! Try again.';
                    btn.style.background = 'red';
                    btn.disabled = false;
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                    }, 3000);
                });
            } else {
                console.error("Firebase not initialized");
                alert("System Error: Could not connect to database.");
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
