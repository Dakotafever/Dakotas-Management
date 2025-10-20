// script.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");

  // NEW: Music track list
  const tracks = [
    "music/music1.mp3",
    "music/music2.mp3",
    "music/music3.mp3",
    "music/music4.mp3"
  ];
  let currentTrack = 0;

  // Control elements (you’ll add them in HTML)
  const nextBtn = document.getElementById("musicNext");
  const prevBtn = document.getElementById("musicPrev");
  const volumeSlider = document.getElementById("volumeSlider");

  let isPlaying = true;
  let userPaused = false;
  let fadeInterval = null;

  // Set first track
  audio.src = tracks[currentTrack];
  audio.volume = 0;

  // Try to autoplay
  const tryPlay = async () => {
    try {
      await audio.play();
      fadeIn(audio, 0.6, 1500);
    } catch (err) {
      console.warn("Autoplay blocked. Music will start on user action.");
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    }
  };

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

  // Toggle play/pause
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

  // ✅ NEXT / PREVIOUS TRACKS
  nextBtn.addEventListener("click", () => switchTrack(1));
  prevBtn.addEventListener("click", () => switchTrack(-1));

  function switchTrack(direction) {
    currentTrack = (currentTrack + direction + tracks.length) % tracks.length;
    audio.src = tracks[currentTrack];
    audio.play();
    fadeIn(audio, 0.6, 1000);
    toggleBtn.textContent = "🔊 Pause Music";
    isPlaying = true;
  }

  // ✅ Volume Control
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
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

  // Optional auto-track switch every 3 min
  setInterval(() => {
    if (isPlaying && !userPaused) {
      switchTrack(1);
    }
  }, 180000);

  // Start attempt
  tryPlay();
});
