// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory session storage (for demo; reset on server restart)
const sessions = {};

app.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ reply: "Missing sessionId or message." });
    }

    // Initialize session if not exists
    if (!sessions[sessionId]) {
      sessions[sessionId] = [
        {
          role: "system",
          content:
            "You are Zeud, a friendly, helpful, and witty AI chatbot. Answer questions clearly and politely. Engage in casual conversation, provide advice, and explain concepts when needed.",
        },
      ];
    }

    // Add user message to session
    sessions[sessionId].push({ role: "user", content: message });

    // Call OpenAI API with session messages
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: sessions[sessionId],
      temperature: 0.7, // adjust for creativity
    });

    const reply = response.choices[0].message.content;

    // Add bot reply to session
    sessions[sessionId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ Error calling OpenAI API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
