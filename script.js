// The API key is injected automatically by GitHub Actions
const apiKey = 'YOUR_YOUTUBE_API_KEY_HERE'; // injected from secret

// Your channel ID
const channelId = "UCVW3aGXZwnMo8yLEYhgJkqA"; 

async function loadLatestVideo() {
  try {
    if (!apiKey) {
      console.error("API key is missing.");
      return;
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=1`);
    const data = await response.json();
    const latest = data.items[0];

    if (!latest) {
      console.error("No videos found for this channel.");
      return;
    }

    const isLive = latest.snippet.liveBroadcastContent === "live";
    const videoId = latest.id.videoId;
    const link = `https://www.youtube.com/watch?v=${videoId}`;

    const container = document.getElementById("latest-video");
    if (!container) {
      console.error("No container with id 'latest-video' found.");
      return;
    }

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


setInterval(loadLatestVideo, 5 * 60 * 1000);

console.log("Ignore Me, This Was A Test For My Bot Im Making!")
