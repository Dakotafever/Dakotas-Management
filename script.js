// script.js - unified audio + YouTube auto-pause with fade
document.addEventListener("DOMContentLoaded", () => {
  const AUDIO_SRC = "music/theme.mp3"; // update path if needed
  const TARGET_VOLUME = 0.6;
  const FADE_IN_MS = 1200;
  const FADE_OUT_MS = 600;
  let fadeInterval = null;

  // 1) Ensure there's a single audio element (use existing if present)
  let audioEl = document.getElementById("bgMusic");
  if (!audioEl) {
    audioEl = document.createElement("audio");
    audioEl.id = "bgMusic";
    audioEl.src = AUDIO_SRC;
    audioEl.loop = true;
    audioEl.preload = "auto";
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);
  }
  audioEl.volume = 0; // start silent

  // 2) Ensure a toggle button exists (create if missing)
  let toggleBtn = document.getElementById("musicToggle");
  if (!toggleBtn) {
    toggleBtn = document.createElement("button");
    toggleBtn.id = "musicToggle";
    toggleBtn.className = "music-btn";
    toggleBtn.textContent = "🔊 Pause Music";
    document.body.appendChild(toggleBtn);
  }

  // State flags
  let isPlaying = false;      // whether music is currently audible/playing
  let userPaused = false;     // true if user manually paused (prevent auto-resume)

  // utility: update button text
  function updateToggleText() {
    toggleBtn.textContent = isPlaying ? "🔊 Pause Music" : "🔈 Play Music";
  }

  // fade to target volume over duration (ms). If targetVol === 0 -> pause at end.
  function fadeTo(targetVol, duration = 600) {
    if (fadeInterval) clearInterval(fadeInterval);
    const stepMs = 50;
    const steps = Math.max(1, Math.ceil(duration / stepMs));
    const start = audioEl.volume;
    const diff = targetVol - start;
    let step = 0;

    // Ensure audio is playing so volume changes are heard
    if (audioEl.paused && targetVol > 0) {
      // attempt to play, ignore rejection (autoplay may be blocked)
      audioEl.play().catch(() => {});
    }

    fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      audioEl.volume = Math.min(1, Math.max(0, start + diff * progress));
      if (step >= steps) {
        clearInterval(fadeInterval);
        fadeInterval = null;
        if (targetVol === 0) {
          try { audioEl.pause(); } catch (e) {}
          isPlaying = false;
        } else {
          isPlaying = true;
        }
        updateToggleText();
      }
    }, stepMs);
  }

  // Attempt autoplay and fade in if allowed
  async function startAndFadeIn() {
    // If autoplay already succeeded earlier, just fade to target
    if (!audioEl.paused || audioEl.currentTime > 0) {
      fadeTo(TARGET_VOLUME, FADE_IN_MS);
      return;
    }

    // Try to play (may be blocked); if play succeeds, fade in
    try {
      await audioEl.play();
      fadeTo(TARGET_VOLUME, FADE_IN_MS);
      userPaused = false;
    } catch (err) {
      // Autoplay blocked — keep audio paused at volume 0.
      console.warn("Autoplay blocked (user gesture required to start audio):", err);
      isPlaying = false;
      updateToggleText();
    }
  }

  // Fade out and pause
  function fadeOutAndPause() {
    fadeTo(0, FADE_OUT_MS);
  }

  // Toggle button click handler (manual control)
  toggleBtn.addEventListener("click", async () => {
    if (isPlaying) {
      // user is pausing
      userPaused = true;
      fadeOutAndPause();
    } else {
      // user is resuming
      userPaused = false;
      await startAndFadeIn();
    }
  });

  // 3) Listen for YouTube player messages (requires enablejsapi=1 on iframe src)
  window.addEventListener("message", (event) => {
    // Only try to parse structured messages; ignore random strings
    let data = event.data;
    if (!data) return;

    // If the message is a string that looks like JSON, parse it
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // not JSON — ignore
        return;
      }
    }

    // YouTube Iframe API postMessage format includes event: "onStateChange" and info code
    // info === 1 -> playing, 2 -> paused, 0 -> ended
    if (data && (data.event === "onStateChange" || data.event === "info") && typeof data.info === "number") {
      const state = data.info;
      if (state === 1) {
        // video started playing -> fade out music
        userPaused = userPaused || false; // keep flag as is
        fadeOutAndPause();
      } else if ((state === 2 || state === 0) && !userPaused) {
        // video paused or ended and user didn't manually pause -> resume music
        startAndFadeIn();
      }
    }
  });

  // Try to start on load
  startAndFadeIn();

  // initial toggle text
  updateToggleText();

  // Optional: highlight nav links in either .dr-nav or .navbar
  try {
    const path = window.location.pathname.split("/").pop();
    document.querySelectorAll(".dr-nav a, .navbar a").forEach(link => {
      if (link.getAttribute("href") === path) {
        link.classList.add("active");
      }
    });
  } catch (e) { /* ignore */ }
});
