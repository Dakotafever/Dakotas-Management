const startBtn = document.getElementById("startBtn");
const lane = document.getElementById("lane");
const result = document.getElementById("result");

let audio, startTime;
let notes = [
  { time: 1 },
  { time: 2 },
  { time: 3 },
  { time: 4 },
  { time: 5 },
];

const NOTE_SPEED = 300; // pixels per second

startBtn.onclick = async () => {
  // ✅ updated path for your songs folder
  audio = new Audio("songs/song.mp3"); 
  await audio.play();
  startTime = performance.now() / 1000;
  startBtn.disabled = true;
  spawnNotes();
  update();
};

function spawnNotes() {
  notes.forEach((n) => {
    const note = document.createElement("div");
    note.className = "note";
    note.dataset.time = n.time;
    note.style.top = "-20px";
    lane.appendChild(note);
  });
}

function update() {
  const now = performance.now() / 1000 - startTime;
  const noteElements = document.querySelectorAll(".note");

  noteElements.forEach((note) => {
    const noteTime = parseFloat(note.dataset.time);
    const y = (noteTime - now) * NOTE_SPEED * 100;
    note.style.top = `${500 - y}px`;

    if (parseFloat(note.style.top) > 500) note.remove();
  });

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    const now = performance.now() / 1000 - startTime;
    const closest = notes.find((n) => Math.abs(n.time - now) < 0.15);
    if (closest) {
      result.textContent = "Hit!";
      notes = notes.filter((n) => n !== closest);
    } else {
      result.textContent = "Miss!";
    }
  }
});
