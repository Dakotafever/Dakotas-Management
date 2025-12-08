document.addEventListener("DOMContentLoaded", () => {
  const snowContainer = document.createElement("div");
  snowContainer.style.position = "fixed";
  snowContainer.style.top = "0";
  snowContainer.style.left = "0";
  snowContainer.style.width = "100%";
  snowContainer.style.height = "100%";
  snowContainer.style.pointerEvents = "none";
  snowContainer.style.zIndex = "99999";
  document.body.appendChild(snowContainer);

  function createSnowflake() {
    const flake = document.createElement("div");
    flake.innerHTML = "❄";
    flake.style.position = "absolute";
    flake.style.color = "white";
    flake.style.fontSize = `${Math.random() * 12 + 8}px`;
    flake.style.left = `${Math.random() * window.innerWidth}px`;
    flake.style.opacity = Math.random() * 0.8 + 0.2;

    // Random animation duration & horizontal sway
    const fallDuration = Math.random() * 10 + 10; // 10–20s
    const swayDistance = Math.random() * 50 + 20; // px
    flake.style.animation = `snowFall ${fallDuration}s linear forwards, sway ${fallDuration/2}s ease-in-out infinite alternate`;

    snowContainer.appendChild(flake);

    setTimeout(() => flake.remove(), fallDuration * 1000);
  }

  setInterval(createSnowflake, 200);
});
