// server.js
import express from "express";
import fetch from "node-fetch"; // or use native fetch in Node 18+
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HUGGINGFACE_API_KEY = "YOUR_HUGGINGFACE_API_KEY";
const MODEL = "gpt2"; // free-tier model for testing

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
        options: { wait_for_model: true },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    // Hugging Face returns an array with 'generated_text'
    const botReply = data[0]?.generated_text || "Sorry, I couldn't generate a response.";

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
