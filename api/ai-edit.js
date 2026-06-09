import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { request } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a website assistant for Devil's Roulette.

Your job:
Convert user requests into SAFE website edit suggestions.

ONLY allow:
- text changes
- adding sections
- updating links
- updating images

DO NOT generate dangerous or code-execution content.

Return ONLY JSON in this format:

{
  "file": "devilsroulette.html",
  "action": "replace | add | update",
  "target": "text or section name",
  "newContent": "HTML or text update",
  "reason": "short explanation"
}
`
        },
        {
          role: "user",
          content: request
        }
      ],

      temperature: 0.3
    });

    const result = completion.choices[0].message.content;

    return res.status(200).json({
      success: true,
      suggestion: JSON.parse(result)
    });

  } catch (err) {
    return res.status(500).json({
      error: "AI failed",
      details: err.message
    });
  }
}

await fetch(`${process.env.VERCEL_URL}/api/send-change`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    suggestion: JSON.parse(result)
  })
});