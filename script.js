// Devil's Roulette — Music with Cross-Tab Autoplay
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  let isPlaying = true;
  let fadeInterval;
  const targetVolume = 0.6;

  if (!audio || !toggleBtn) return;

  function fadeIn() {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      audio.volume = Math.min(audio.volume + 0.05, targetVolume);
      if (audio.volume >= targetVolume) clearInterval(fadeInterval);
    }, 100);
  }

  function fadeOut(callback) {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      audio.volume = Math.max(audio.volume - 0.05, 0);
      if (audio.volume <= 0) {
        clearInterval(fadeInterval);
        if (callback) callback();
      }
    }, 100);
  }

  // Try autoplay
  audio.play().then(() => {
    fadeIn();
    sessionStorage.setItem("musicAllowed", "yes");
  }).catch(() => {
    document.addEventListener("click", () => {
      audio.play().then(fadeIn);
    }, { once: true });
  });

  toggleBtn.onclick = () => {
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

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    audio.play();
    fadeIn();
  });
});


window.addEventListener("load", () => {

  const intro = document.getElementById("introScreen");

  // Only show once per session
  if (sessionStorage.getItem("introPlayed")) {
    intro.style.display = "none";
    return;
  }

  setTimeout(() => {
    intro.style.transition = "opacity 1s ease";
    intro.style.opacity = "0";

    setTimeout(() => {
      intro.style.display = "none";
    }, 1000);

  }, 3500);

  sessionStorage.setItem("introPlayed", "true");
});
