// Devil's Roulette — Music with Cross-Tab Autoplay & Video Pause
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  let isPlaying = true;
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
    audio.play()
      .then(() => {
        fadeIn();
        sessionStorage.setItem("musicAllowed", "yes");
      })
      .catch(() => {});
  }

  if (sessionStorage.getItem("musicAllowed") === "yes") {
    startMusic();
  } else {
    document.addEventListener("click", () => {
      startMusic();
    }, { once: true });
  }

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
