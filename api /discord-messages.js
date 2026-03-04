export default async function handler(req, res) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = "1256359526022774820";

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=5`,
      {
        headers: {
          Authorization: `Bot ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(
      data.map(m => ({
        content: m.content,
        author: m.author.username,
        avatar: `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`,
        timestamp: m.timestamp
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
