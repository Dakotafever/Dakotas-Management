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
  const flash = document.querySelector(".flash");
  const sound = document.getElementById("introSound");

  function playIntro() {
    intro.style.display = "flex";
    intro.style.opacity = "1";

    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.7;
      sound.play().catch(() => {});
    }

    // Flash effect before fade out
    setTimeout(() => {
      flash.style.opacity = "1";
      flash.style.transition = "opacity 0.2s ease";
    }, 3300);

    setTimeout(() => {
      flash.style.opacity = "0";
    }, 3500);

    setTimeout(() => {
      intro.style.opacity = "0";
    }, 3600);

    setTimeout(() => {
      intro.style.display = "none";
    }, 4700);
  }

  // Auto play once
  if (!sessionStorage.getItem("introPlayed")) {
    playIntro();
    sessionStorage.setItem("introPlayed", "true");
  } else {
    intro.style.display = "none";
  }

  // Replay with R key
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
      playIntro();
    }
  });

});

