// script.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = new Audio("music/theme.mp3");
  audio.loop = true;
  audio.volume = 0; // start muted

  // Try autoplay immediately
  const tryPlay = async () => {
    try {
      await audio.play();

      // Gradually fade in volume
      let vol = 0;
      const fadeIn = setInterval(() => {
        if (vol < 0.6) {
          vol += 0.02;
          audio.volume = vol;
        } else {
          clearInterval(fadeIn);
        }
      }, 200);
    } catch (err) {
      console.warn("Autoplay blocked:", err);
    }
  };

  tryPlay();

  // Background music control
const bgMusic = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("musicToggle");
let isPlaying = true;

// Pause or play manually
toggleBtn.addEventListener("click", () => {
  if (isPlaying) {
    bgMusic.pause();
    toggleBtn.textContent = "🔈 Play Music";
  } else {
    bgMusic.play();
    toggleBtn.textContent = "🔊 Pause Music";
  }
  isPlaying = !isPlaying;
});

// Auto-pause when a YouTube video starts playing
window.addEventListener("message", (event) => {
  // YouTube sends "play" or "pause" messages through postMessage API
  if (event.data && typeof event.data === "string") {
    if (event.data.includes("playVideo")) {
      bgMusic.pause();
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    }
  }
});

  
  // Highlight active nav link
  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar a").forEach(link => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });
});
