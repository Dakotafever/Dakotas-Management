// api/discord-messages.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const token = process.env.DISCORD_BOT_TOKEN; // set in Vercel
  const channels = ['1256359526022774820']; // replace with your Discord channel IDs

  try {
    const messages = await Promise.all(channels.map(async (id) => {
      const response = await fetch(`https://discord.com/api/v10/channels/${id}/messages?limit=5`, {
        headers: { Authorization: `Bot ${token}` }
      });
      const data = await response.json();
      return {
        channelId: id,
        messages: data.map(m => m.content)
      };
    }));

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
