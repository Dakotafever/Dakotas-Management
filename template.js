// template.js
const channelId = "UCVW3aGXZwnMo8yLEYhgJkqA";

async function loadLatestVideo() {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=1`);
    const data = await response.json();
    const latest = data.items[0];

    if (!latest) return;

    const isLive = latest.snippet.liveBroadcastContent === "live";
    const videoId = latest.id.videoId;
    const link = `https://www.youtube.com/watch?v=${videoId}`;

    const container = document.getElementById("latest-video");
    container.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
      <h3>${latest.snippet.title}</h3>
      <a href="${link}" class="btn primary" target="_blank" rel="noopener noreferrer">
        ${isLive ? "Watch Live" : "Watch on YouTube"}
      </a>
    `;
  } catch (error) {
    console.error("Error fetching latest video:", error);
  }
}

loadLatestVideo();
