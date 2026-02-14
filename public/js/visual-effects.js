/**
 * visual-effects.js
 * Handles custom cursor, scroll reveals, and staggered animations for BlueSentinel V2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // initCustomCursor(); // Disabled per user request
    initScrollReveal();
    initStaggeredLoad();
    initTypewriter();
    initTiltEffect();
});

/**
 * 1. Custom 'Magnetic' Cursor
 */
function initCustomCursor() {
    // Only enable on desktop/fine pointer devices
    if (matchMedia('(pointer:fine)').matches) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        const follower = document.createElement('div');
        follower.classList.add('cursor-follower');
        document.body.appendChild(follower);

        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Immediate update for dot
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        // Smooth follow for ring
        function animateFollower() {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;

            follower.style.transform = `translate3d(${posX - 12}px, ${posY - 12}px, 0)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover Effects
        const interactiveElements = document.querySelectorAll('a, button, .bento-card, .nav-item, input, select');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                follower.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                follower.classList.remove('active');
            });
        });

        // Add class to body to hide default cursor
        document.body.classList.add('custom-cursor-enabled');
    }
}

/**
 * 2. Scroll Reveal Animation (Intersection Observer)
 */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * 3. Staggered Load for Dashboard Grid
 */
function initStaggeredLoad() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;
    });
}

/**
 * 4. Typewriter Effect
 */
function initTypewriter() {
    const element = document.getElementById('typewriter-text');
    if (!element) return;

    const phrases = [
        "River Intelligence.",
        "Heavy Metal Detection.",
        "Ammonia Tracking.",
        "Predictive AI."
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster deletion
        } else {
            element.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Finished typing phrase
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before next
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/**
 * 5. 3D Tilt Effect for Cards
 */
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (max 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}
