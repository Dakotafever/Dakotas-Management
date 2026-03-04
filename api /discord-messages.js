// api/discord-messages.js

const fetch = require("node-fetch"); // make sure node-fetch is installed in your package.json

module.exports = async (req, res) => {
  try {
    // Grab your bot token and channel ID from environment variables
    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

    if (!DISCORD_TOKEN || !CHANNEL_ID) {
      return res.status(500).json({ error: "Missing Discord token or channel ID" });
    }

    // Fetch the last 5 messages from the Discord channel
    const response = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=5`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: "Discord API error", details: errorData });
    }

    const data = await response.json();

    // Only return the fields we need (username + content)
    const messages = data.map(msg => ({
      username: msg.author.username,
      avatar: msg.author.avatar ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png` : null,
      content: msg.content
    }));

    res.status(200).json(messages);

  } catch (err) {
    console.error("Discord API fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
