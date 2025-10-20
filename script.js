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

// autoplay when possible
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

// functions exposed to window for HTML buttons
window.playTrack = function () {
  audio.play();
};

window.pauseTrack = function () {
  audio.pause();
};

window.nextTrack = function () {
  currentTrack = (currentTrack + 1) % tracks.length;
  audio.src = tracks[currentTrack];
  audio.play();
};

window.prevTrack = function () {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  audio.src = tracks[currentTrack];
  audio.play();
};

// auto-next when song ends
audio.addEventListener("ended", () => {
  window.nextTrack();
});

