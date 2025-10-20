// script.js
// ======================
// 🎃 SPOOKY BACKGROUND
// ======================
const spookyImages = [
  "images/bats1.png",
  "images/ghost1.png",
  "images/ghost2.png",
  "images/ghost3.png",
  "images/web1.png",
  "images/web2.png",
];

const maxSpookyElements = 10; // number of spooky decorations on screen
const spookyContainer = document.createElement("div");
spookyContainer.classList.add("spooky-container");
document.body.appendChild(spookyContainer);

function spawnSpooky() {
  if (spookyContainer.children.length >= maxSpookyElements) return;

  const img = document.createElement("img");
  img.src = spookyImages[Math.floor(Math.random() * spookyImages.length)];
  img.classList.add("spooky-item");

  // random position
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  img.style.left = `${x}vw`;
  img.style.top = `${y}vh`;

  // random size
  const size = 40 + Math.random() * 60;
  img.style.width = `${size}px`;

  spookyContainer.appendChild(img);

  // auto remove after some time
  setTimeout(() => {
    spookyContainer.removeChild(img);
  }, 30000 + Math.random() * 20000); // 30-50s
}

// spawn initial spooky items
for (let i = 0; i < maxSpookyElements; i++) {
  spawnSpooky();
}

// respawn new spooky items randomly
setInterval(spawnSpooky, 5000);





// ======================
// 🎃 MUSIC PLAYER
// ======================
const tracks = [
  "music/music1.mp3",
  "music/music2.mp3",
  "music/music3.mp3",
  "music/music4.mp3",
];

let currentTrack = 0;
const audio = new Audio(tracks[currentTrack]);
audio.volume = 0.5;
audio.loop = false;

// try autoplay when page loads
window.addEventListener("load", () => {
  audio.play().catch(() => {
    // if autoplay is blocked, wait for first click
    const resume = () => {
      audio.play();
      document.removeEventListener("click", resume);
    };
    document.addEventListener("click", resume);
  });
});

function playTrack() {
  audio.play();
}

function pauseTrack() {
  audio.pause();
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  audio.src = tracks[currentTrack];
  audio.play();
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  audio.src = tracks[currentTrack];
  audio.play();
}


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
