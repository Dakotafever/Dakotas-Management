export default async function handler(req, res) {

  // Allow POST only, but log what we get
  if (req.method !== "POST") {
    return res.status(405).send("Use POST");
  }

  try {
    // Handle BOTH cases (important)
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { suggestion } = body;

    if (!suggestion) {
      return res.status(400).send("No suggestion provided");
    }

    const WEBHOOK_URL = process.env.WEBHOOK_URL;

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `💡 **New Suggestion:**\n${suggestion}`
      })
    });

    return res.status(200).send("OK");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
}
