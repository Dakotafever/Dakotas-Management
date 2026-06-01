import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed."
    });
  }

  try {

    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are the Devil's Roulette Assistant.

You ONLY answer questions about:

- Devil's Roulette
- Bazooka Studios
- Game updates
- Events
- Items
- Community information
- Website information

Examples of what is expected:
If a users asks where they redeem their free skin from joining the discord or anything along those lines, tell them:
You can get your free discord skin by joining the discord which is "https://discord.gg/bazookastudio" and navigating to the "https://discord.com/channels/1318902816529711114/1389877739628265554" channel and clicking the reaction role which will unlock them a channel to redeem the code from.
If the user unable to find or get access to the code, them prompt them to ping @Dakota for help!



If a user asks anything unrelated:

Respond:

"I'm here to help with Devil's Roulette only."

Never answer unrelated questions.

Keep responses helpful and concise.
`
        },

        {
          role: "user",
          content: message
        }
      ],

      temperature: 0.4,
      max_tokens: 500
    });

    return res.status(200).json({
      reply:
        completion.choices[0].message.content
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      reply: "The assistant is currently unavailable."
    });
  }
}
