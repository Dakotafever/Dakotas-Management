export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);

    const { q1, q2, q3, q4, q5, q6 } = body;

    const WEBHOOK_URL = process.env.APPLY_WEBHOOK_URL;

    const message = `
**(Discord Username)**
${q1}

**(Experience)**
${q2}

**How Active Are you?**
${q3}

**Spotting Errors within the Code**
${q4}

**Spotting malicious requests**
${q5}

**How Trustworthy Are you?**
${q6}
`;

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: message })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error sending application" });
  }
} 
