// script.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = new Audio("music/theme.mp3");
  audio.loop = true;
  audio.volume = 0; // start muted

  // Try autoplay immediately
  const tryPlay = async () => {
    try {
      await audio.play();

      // Gradually fade in volume
      let vol = 0;
      const fadeIn = setInterval(() => {
        if (vol < 0.6) {
          vol += 0.02;
          audio.volume = vol;
        } else {
          clearInterval(fadeIn);
        }
      }, 200);
    } catch (err) {
      console.warn("Autoplay blocked:", err);
    }
  };

  tryPlay();

  // Highlight active nav link
  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar a").forEach(link => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });
});
