/**
 * landing-effects.js
 * Handles Canvas-based Dotted Glow and interactions for the Landing Page
 * Implements "Constellation Effect": Dots connected by lines when close.
 */

document.addEventListener('DOMContentLoaded', () => {
    initDottedGlow();
});

function initDottedGlow() {
    const canvas = document.getElementById('dotted-glow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const particleCount = 100; // Number of dots
    const connectionDistance = 150; // Max distance to draw line
    const mouseDistance = 200; // Interaction radius

    // Mouse state
    let mouse = { x: null, y: null };

    // Resize handler
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createParticles();
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Velocity X
            this.vy = (Math.random() - 0.5) * 0.5; // Velocity Y
            this.size = Math.random() * 2 + 1; // Random size 1-3px
            this.baseColor = 'rgba(0, 255, 212, 0.5)'; // Cyan tint
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;

                    // Gentle push away or pull towards (optional)
                    // this.vx -= forceDirectionX * force * 0.05;
                    // this.vy -= forceDirectionY * force * 0.05;
                }
            }
        }

        draw() {
            ctx.fillStyle = this.baseColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        // Adjust particle count based on screen size
        const density = Math.floor(width * height / 15000);
        for (let i = 0; i < density; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Connect particles
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    // Opacity based on distance
                    let opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(84, 101, 255, ${opacity * 0.2})`; // Blue-ish lines
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // Connect to mouse
            if (mouse.x != null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    ctx.beginPath();
                    let opacity = 1 - (distance / mouseDistance);
                    ctx.strokeStyle = `rgba(0, 255, 212, ${opacity * 0.4})`; // Cyan lines to mouse
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    // Init
    resize();
    animate();
}
