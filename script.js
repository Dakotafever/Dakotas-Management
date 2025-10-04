document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  if (!music || !toggle) return;

  // Try to autoplay music
  const savedState = localStorage.getItem("musicState");
  const shouldPlay = savedState !== "paused"; // default: autoplay

  const tryPlay = () => {
    if (shouldPlay) {
      music.volume = 0.5;
      music.play().then(() => {
        toggle.textContent = "🔊";
        localStorage.setItem("musicState", "playing");
      }).catch(() => {
        // Browser blocked autoplay — wait for click
        toggle.textContent = "🔇";
      });
    }
  };

  tryPlay();

  toggle.addEventListener("click", () => {
    if (music.paused) {
      music.volume = 0.5;
      music.play().catch(() => {});
      toggle.textContent = "🔊";
      localStorage.setItem("musicState", "playing");
    } else {
      music.pause();
      toggle.textContent = "🔇";
      localStorage.setItem("musicState", "paused");
    }
  });
});
