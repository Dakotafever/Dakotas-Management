// Devil's Roulette — Music with Cross-Tab Autoplay & Video Pause
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  let isPlaying = false;
  let fadeInterval;
  const targetVolume = 0.6;

  audio.volume = 0;

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

  function startMusic() {
    audio.play().then(() => {
      fadeIn();
      isPlaying = true;
      toggleBtn.textContent = "🔊 Pause Music";
      sessionStorage.setItem("musicAllowed", "yes");
    }).catch(() => {
      console.log("Autoplay blocked, waiting for user interaction.");
    });
  }

  // Only start music after first user interaction
  if (sessionStorage.getItem("musicAllowed") === "yes") {
    // Already allowed → try to play immediately
    startMusic();
  } else {
    // Wait for a click anywhere on the page
    document.addEventListener("click", startMusic, { once: true });
  }

  toggleBtn.addEventListener("click", () => {
    if (isPlaying) {
      fadeOut(() => audio.pause());
      toggleBtn.textContent = "🔈 Play Music";
      isPlaying = false;
    } else {
      audio.play().then(() => {
        fadeIn();
        toggleBtn.textContent = "🔊 Pause Music";
        isPlaying = true;
      });
    }
  });

  // Looping music with fade-in
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    audio.play().then(fadeIn).catch(() => {});
  });
});
  // --------------------------
  // VIDEO PAUSE/RESUME SUPPORT
  // --------------------------
  let activePlayers = 0;

  // YouTube Iframe API
  if (window.YT) {
    onYouTubeIframeAPIReady();
  } else {
    // Load YT API if not already loaded
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = function() {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      // Only YouTube videos
      if (!iframe.src.includes("youtube.com/embed")) return;

      new YT.Player(iframe, {
        events: {
          'onStateChange': function(event) {
            if (event.data === YT.PlayerState.PLAYING) {
              activePlayers++;
              if (!audio.paused) fadeOut(() => audio.pause());
              toggleBtn.textContent = "🔇 Music Paused (Video Playing)";
            }
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              activePlayers = Math.max(0, activePlayers - 1);
              if (activePlayers === 0 && !isPlaying) return; // user paused manually
              if (activePlayers === 0) {
                audio.play();
                fadeIn();
                toggleBtn.textContent = "🔊 Pause";
              }
            }
          }
        }
      });
    });
  };

  // TikTok embed support (approximate, pauses on click)
  document.addEventListener("click", (e) => {
    const tiktokEmbed = e.target.closest(".tiktok-embed");
    if (!tiktokEmbed) return;

    activePlayers++;
    if (!audio.paused) fadeOut(() => audio.pause());
    toggleBtn.textContent = "🔇 Music Paused (Video Playing)";

    // Resume after ~30 seconds (typical TikTok video length)
    setTimeout(() => {
      activePlayers = Math.max(0, activePlayers - 1);
      if (activePlayers === 0 && isPlaying) {
        audio.play();
        fadeIn();
        toggleBtn.textContent = "🔊 Pause";
      }
    }, 30000);
  });

});
