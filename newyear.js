(function () {

    const now = new Date();
    const month = now.getMonth(); // 0 = Jan
    const day = now.getDate();
    const year = now.getFullYear();

    // Only run Dec 29, 30, 31
    if (!(month === 11 && day >= 29)) {
        return; // Exit immediately rest of year
    }

    const target = new Date(year + 1, 0, 1, 0, 0, 0);

    startCountdown(target);

    function startCountdown(targetTime) {

        const box = document.createElement("div");
        box.id = "ny-countdown";
        document.body.appendChild(box);

        const interval = setInterval(() => {

            const now = new Date();
            const distance = targetTime - now;

            if (distance <= 0) {
                clearInterval(interval);
                box.remove();
                startFireworks();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            box.innerHTML = `🎆 ${days}d ${hours}h ${minutes}m ${seconds}s until New Year`;

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
            const y = Math.random() * canvas.height * 0.5;

            for (let i = 0; i < 60; i++) {
                particles.push({
                    x,
                    y,
                    radius: 2,
                    color: `hsl(${Math.random()*360},100%,60%)`,
                    speedX: (Math.random() - 0.5) * 8,
                    speedY: (Math.random() - 0.5) * 8,
                    life: 80
                });
            }
        }

        function animate() {
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.speedX;
                p.y += p.speedY;
                p.life--;
                p.radius *= 0.97;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        const fireworkInterval = setInterval(createFirework, 500);

        setTimeout(() => {
            clearInterval(fireworkInterval);
            canvas.remove();
        }, 15000);
    }

})();