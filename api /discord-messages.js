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

    res.status(200).json([
      {
        channelId,
        messages: data.map(m => m.content)
      }
    ]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
