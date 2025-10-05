// script.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  let isPlaying = true;
  let userPaused = false;
  let fadeInterval = null;

  // Start volume muted
  audio.volume = 0;

  // Try to autoplay
  const tryPlay = async () => {
    try {
      await audio.play();
      fadeIn(audio, 0.6, 1500); // fade to 60% over 1.5s
    } catch (err) {
      console.warn("Autoplay blocked. Music will start on user action.");
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    }
  };

  // Fade-in helper
  function fadeIn(audio, targetVol, duration) {
    if (fadeInterval) clearInterval(fadeInterval);
    const step = 50;
    const steps = duration / step;
    const volIncrement = targetVol / steps;
    let currentVol = 0;
    fadeInterval = setInterval(() => {
      currentVol += volIncrement;
      if (currentVol >= targetVol) {
        currentVol = targetVol;
        clearInterval(fadeInterval);
      }
      audio.volume = currentVol;
    }, step);
  }

  // Fade-out helper
  function fadeOut(audio, duration) {
    if (fadeInterval) clearInterval(fadeInterval);
    const step = 50;
    const steps = duration / step;
    const volDecrement = audio.volume / steps;
    fadeInterval = setInterval(() => {
      audio.volume -= volDecrement;
      if (audio.volume <= 0) {
        audio.volume = 0;
        clearInterval(fadeInterval);
        audio.pause();
      }
    }, step);
  }

  // Manual music toggle
  toggleBtn.addEventListener("click", async () => {
    if (isPlaying) {
      userPaused = true;
      fadeOut(audio, 800);
      toggleBtn.textContent = "🔈 Play Music";
    } else {
      userPaused = false;
      await audio.play();
      fadeIn(audio, 0.6, 1000);
      toggleBtn.textContent = "🔊 Pause Music";
    }
    isPlaying = !isPlaying;
  });

  // Auto-pause when YouTube videos play
  window.addEventListener("message", (event) => {
    if (typeof event.data === "string" && event.data.includes("playVideo")) {
      fadeOut(audio, 600);
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    } else if (typeof event.data === "string" && event.data.includes("pauseVideo")) {
      if (!userPaused) {
        audio.play().then(() => fadeIn(audio, 0.6, 1000));
        toggleBtn.textContent = "🔊 Pause Music";
        isPlaying = true;
      }
    }
  });

  // Start attempt
  tryPlay();
});
