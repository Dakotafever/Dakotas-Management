(function() {

const now = new Date("December 31, 2026 23:59:20");
const year = now.getFullYear();
const newYear = new Date(year + 1, 0, 1);
const diff = newYear - now;

const threeDays = 3 * 24 * 60 * 60 * 1000;

if (diff <= threeDays && diff > 0) {

    // Create countdown box
    const box = document.createElement("div");
    box.id = "ny-countdown";
    document.body.appendChild(box);

    const interval = setInterval(() => {
        const now = new Date();
        const distance = newYear - now;

        if (distance <= 0) {
            clearInterval(interval);
            box.remove();
            startFireworks();
            return;
        }

        const days = Math.floor(distance / (1000*60*60*24));
        const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
        const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
        const seconds = Math.floor((distance % (1000*60)) / 1000);

        box.innerHTML = `🎆 New Year in ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

function startFireworks() {
    const canvas = document.createElement("canvas");
    canvas.id = "fireworks-canvas";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    function createFirework() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height / 2;

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: x,
                y: y,
                radius: 2,
                color: `hsl(${Math.random()*360},100%,50%)`,
                speedX: (Math.random()-0.5) * 6,
                speedY: (Math.random()-0.5) * 6,
                life: 100
            });
        }
    }

    function animate() {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life--;
            p.radius *= 0.98;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
            ctx.fillStyle = p.color;
            ctx.fill();

            if (p.life <= 0) particles.splice(index, 1);
        });

        requestAnimationFrame(animate);
    }

    animate();

    const fireworkInterval = setInterval(createFirework, 500);

    // Stop after 15 seconds
    setTimeout(() => {
        clearInterval(fireworkInterval);
        canvas.remove();
    }, 15000);
}

})();