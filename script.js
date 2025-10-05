document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic") || (() => {
    const a = document.createElement("audio");
    a.id = "bgMusic";
    a.src = "music/theme.mp3";
    a.loop = true;
    a.preload = "auto";
    a.autoplay = true;
    a.style.display = "none";
    document.body.appendChild(a);
    return a;
  })();

  // Create control container
  let controls = document.querySelector(".music-controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "music-controls";

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "musicToggle";
    toggleBtn.className = "music-btn";
    toggleBtn.textContent = "🔊 Pause Music";

    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.id = "volumeSlider";
    volumeSlider.className = "volume-slider";
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.01;
    volumeSlider.value = 0.6;

    controls.appendChild(toggleBtn);
    controls.appendChild(volumeSlider);
    document.body.appendChild(controls);
  }

  const toggleBtn = document.getElementById("musicToggle");
  const volumeSlider = document.getElementById("volumeSlider");

  let isPlaying = true;
  let userPaused = false;
  let fadeInterval = null;
  let targetVolume = 0.6;

  audio.volume = 0;

  // Fade helpers
  function fadeIn(target = targetVolume, duration = 1200) {
    if (fadeInterval) clearInterval(fadeInterval);
    const step = 50;
    const volStep = (target - audio.volume) / (duration / step);
    fadeInterval = setInterval(() => {
      audio.volume = Math.min(target, audio.volume + volStep);
      if (audio.volume >= target) clearInterval(fadeInterval);
    }, step);
  }

  function fadeOut(duration = 800) {
    if (fadeInterval) clearInterval(fadeInterval);
    const step = 50;
    const volStep = audio.volume / (duration / step);
    fadeInterval = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - volStep);
      if (audio.volume <= 0) {
        clearInterval(fadeInterval);
        audio.pause();
      }
    }, step);
  }

  // Try to autoplay and fade in
  async function tryPlay() {
    try {
      await audio.play();
      fadeIn(targetVolume);
    } catch (err) {
      console.warn("Autoplay blocked. Waiting for user gesture.");
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    }
  }

  toggleBtn.addEventListener("click", async () => {
    if (isPlaying) {
      userPaused = true;
      fadeOut();
      toggleBtn.textContent = "🔈 Play Music";
    } else {
      userPaused = false;
      await audio.play();
      fadeIn(targetVolume);
      toggleBtn.textContent = "🔊 Pause Music";
    }
    isPlaying = !isPlaying;
  });

  volumeSlider.addEventListener("input", () => {
    targetVolume = parseFloat(volumeSlider.value);
    audio.volume = targetVolume;
  });

  // YouTube auto-pause
  window.addEventListener("message", (event) => {
    if (typeof event.data === "string" && event.data.includes("playVideo")) {
      fadeOut();
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    } else if (typeof event.data === "string" && event.data.includes("pauseVideo")) {
      if (!userPaused) {
        audio.play().then(() => fadeIn(targetVolume));
        toggleBtn.textContent = "🔊 Pause Music";
        isPlaying = true;
      }
    }
  });

  tryPlay();
});
