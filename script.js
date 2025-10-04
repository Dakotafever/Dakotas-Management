// Devil's Roulette Website Script
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");

  if (!music || !toggle) return;

  // Check saved music state
  const savedState = localStorage.getItem("musicState");

  if (savedState === "playing") {
    music.volume = 0.5;
    music.play().catch(() => {}); // in case browser blocks autoplay
    toggle.textContent = "🔊";
  } else {
    music.pause();
    toggle.textContent = "🔇";
  }

  // Toggle music on click
  toggle.addEventListener("click", () => {
    if (music.paused) {
      music.volume = 0.5;
      music.play().catch(() => {}); // handle autoplay restrictions
      toggle.textContent = "🔊";
      localStorage.setItem("musicState", "playing");
    } else {
      music.pause();
      toggle.textContent = "🔇";
      localStorage.setItem("musicState", "paused");
    }
  });
});
