// Animated Starfield Background - Compatible with all browsers
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;

    const container = document.getElementById('starfield-background');
    const ctx = canvas.getContext('2d');
    
    // Site color scheme
    const colors = {
        primaryTeal: '#00796b',
        lightTeal: '#26a69a',
        accent: '#00bfa5',
        background: '#e0f7fa'
    };

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star class
    class Star {
        constructor() {
            this.reset();
            this.z = Math.random() * 2000;
        }

        reset() {
            this.x = (Math.random() - 0.5) * 2000;
            this.y = (Math.random() - 0.5) * 2000;
            this.z = 2000;
            this.prevZ = this.z;
        }

        update(speed) {
            this.prevZ = this.z;
            this.z -= speed;
            
            if (this.z <= 0) {
                this.reset();
            }
        }

        draw() {
            const x = (this.x / this.z) * canvas.width + canvas.width / 2;
            const y = (this.y / this.z) * canvas.height + canvas.height / 2;
            const prevX = (this.x / this.prevZ) * canvas.width + canvas.width / 2;
            const prevY = (this.y / this.prevZ) * canvas.height + canvas.height / 2;

            const size = (1 - this.z / 2000) * 3;
            const opacity = 1 - this.z / 2000;

            // Draw star trail
            ctx.strokeStyle = `rgba(0, 121, 107, ${opacity * 0.5})`;
            ctx.lineWidth = size * 0.5;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw star
            ctx.fillStyle = `rgba(38, 166, 154, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.accent;
            ctx.fillStyle = `rgba(0, 191, 165, ${opacity * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Create stars
    const numStars = 200;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }

    // Animation
    let speed = 5;
    let animationId;

    function animate() {
        ctx.fillStyle = 'rgba(224, 247, 250, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.update(speed);
            star.draw();
        });

        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Adjust speed on mouse move for interactive effect
    let targetSpeed = 5;
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        targetSpeed = 3 + mouseX * 7;
    });

    // Smooth speed transition
    setInterval(() => {
        speed += (targetSpeed - speed) * 0.1;
    }, 16);
});

