// script.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = new Audio("music/theme.mp3");
  audio.loop = true;
  audio.volume = 0.6;

  // Try autoplay immediately
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Browser blocked autoplay, wait for user interaction
      const overlay = document.createElement("div");
      overlay.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.85);
          color: white;
          font-size: 1.5rem;
          flex-direction: column;
          z-index: 9999;
        ">
          <p>🎵 Click to enter Devil’s Roulette</p>
          <button id="musicStart" style="
            padding: 12px 24px;
            background-color: #ff3333;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            color: white;
            margin-top: 10px;
          ">Start</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById("musicStart").addEventListener("click", () => {
        audio.play();
        overlay.remove();
      });
    });
  }

  // Highlight active nav link
  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar a").forEach(link => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });
});
