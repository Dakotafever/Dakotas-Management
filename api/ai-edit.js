import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }
  try {
    const { request } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a website editing assistant.
IMPORTANT RULES:
- ONLY return valid JSON
- DO NOT explain anything
- DO NOT use markdown
- DO NOT wrap in \`\`\`
- DO NOT add extra text
Return ONLY this structure:
{
  "file": "filename.html",
  "action": "replace | add | update",
  "target": "section or text",
  "newContent": "new HTML or text",
  "reason": "why the edit is needed"
}
`
        },
        {
          role: "user",
          content: request
        }
      ],
      temperature: 0.2,
      max_tokens: 400
    });
    const result =
      completion.choices[0].message.content;
    console.log("AI RAW RESPONSE:", result);
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (jsonError) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: result
      });
    }
    return res.status(200).json({
      success: true,
      suggestion: parsed
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
}