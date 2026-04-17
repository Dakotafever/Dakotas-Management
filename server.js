const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const WEBHOOK_URL = "https://discord.com/api/webhooks/1494806857645166731/jPhU-7s5bgRmUUA8KFDb1pAzreV5fBIbcWkn8a3zapTYRRa5TdoIsUEq1LzHjof4W6ef";

app.post("/suggest", async (req, res) => {
  const { suggestion } = req.body;

  if (!suggestion) {
    return res.status(400).send("No suggestion provided");
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `💡 **New Suggestion:**\n${suggestion}`
      })
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
