// ===========================
// Devil's Roulette — Music Player
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  let isPlaying = true;
  let fadeInterval;
  const targetVolume = 0.6; // Final volume after fade-in

  // Start volume muted
  audio.volume = 0;

  // Fade in the audio smoothly
  function fadeIn() {
    clearInterval(fadeInterval);
    const step = 0.05;
    fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume) {
        audio.volume = Math.min(audio.volume + step, targetVolume);
      } else {
        clearInterval(fadeInterval);
      }
    }, 100);
  }

  // Fade out the audio smoothly
  function fadeOut(callback) {
    clearInterval(fadeInterval);
    const step = 0.05;
    fadeInterval = setInterval(() => {
      if (audio.volume > 0) {
        audio.volume = Math.max(audio.volume - step, 0);
      } else {
        clearInterval(fadeInterval);
        if (callback) callback();
      }
    }, 100);
  }

  // Try autoplay when the page loads
  audio.play()
    .then(() => fadeIn())
    .catch(() => {
      console.warn("Autoplay blocked by browser — will play after user interaction.");
      // If autoplay fails, wait for the first click to play the music
      document.addEventListener("click", () => {
        audio.play();
        fadeIn();
        toggleBtn.textContent = "🔊 Pause";
        isPlaying = true;
      }, { once: true });
    });

  // Handle play/pause toggle button
  window.toggleMusic = function () {
    if (isPlaying) {
      fadeOut(() => audio.pause());
      toggleBtn.textContent = "🔈 Play";
    } else {
      audio.play();
      fadeIn();
      toggleBtn.textContent = "🔊 Pause";
    }
    isPlaying = !isPlaying;
  };

  // Replay the song automatically when it ends
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    audio.play();
    fadeIn();
  });
});
