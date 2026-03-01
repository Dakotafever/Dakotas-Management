// api/discord-messages.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const token = process.env.DISCORD_BOT_TOKEN; // set in Vercel
  const channels = ['1369534521547948102', '1369534701550829628', '1429755187010211881', '1384382502621155389', '1369976563700994190', '1444131067425718364', '1466694689582223526', '1341656039346671617']; // replace with your Discord channel IDs

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
