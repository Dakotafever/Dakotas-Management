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
  const sound = document.getElementById("introSound");

  if (sessionStorage.getItem("introPlayed")) {
    intro.style.display = "none";
    return;
  }

  setTimeout(() => {
    if (sound) {
      sound.volume = 0.5;
      sound.play().catch(() => {});
    }
  }, 2500);

  setTimeout(() => {
    intro.style.transition = "opacity 1.2s ease";
    intro.style.opacity = "0";

    setTimeout(() => {
      intro.style.display = "none";
    }, 1200);

  }, 4000);

  sessionStorage.setItem("introPlayed", "true");
});

window.addEventListener("load", () => {

  const intro = document.getElementById("introScreen");
  const sound = document.getElementById("introSound");

  function playIntro() {
    intro.style.display = "flex";
    intro.style.opacity = "1";

    // Force reflow to restart animations
    intro.innerHTML += "";

    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.6;
      sound.play().catch(() => {});
    }

    setTimeout(() => {
      intro.style.transition = "opacity 1.2s ease";
      intro.style.opacity = "0";

      setTimeout(() => {
        intro.style.display = "none";
      }, 1200);

    }, 4000);
  }

  // Only auto-play once per session
  if (!sessionStorage.getItem("introPlayed")) {
    playIntro();
    sessionStorage.setItem("introPlayed", "true");
  } else {
    intro.style.display = "none";
  }

  // 🔥 SECRET REPLAY KEY (Press R)
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
      sessionStorage.removeItem("introPlayed");
      playIntro();
    }
  });
});
