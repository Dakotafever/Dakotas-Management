export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { suggestion } = req.body;

    const webhookURL = process.env.DISCORD_WEBHOOK_URL;

    const message = {
      content: "⚠️ **Devil's Roulette Website Change Request**",
      embeds: [
        {
          title: "Proposed Edit",
          color: 16711680,
          fields: [
            {
              name: "File",
              value: suggestion.file || "unknown"
            },
            {
              name: "Action",
              value: suggestion.action || "unknown"
            },
            {
              name: "Target",
              value: suggestion.target || "unknown"
            },
            {
              name: "New Content",
              value: "```" + (suggestion.newContent || "") + "```"
            },
            {
              name: "Reason",
              value: suggestion.reason || "No reason provided"
            }
          ]
        }
      ]
    };

    await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    return res.status(200).json({
      success: true
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}