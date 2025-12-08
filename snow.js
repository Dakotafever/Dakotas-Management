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
    flake.style.fontSize = Math.random() * 10 + 10 + "px";
    flake.style.left = Math.random() * window.innerWidth + "px";
    flake.style.animation = `snowFall ${3 + Math.random() * 5}s linear`;
    flake.style.opacity = Math.random();

    snowContainer.appendChild(flake);

    setTimeout(() => flake.remove(), 8000);
  }

  setInterval(createSnowflake, 150);
});
