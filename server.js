// server.js
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // make sure this env var is set in Render
});
const openai = new OpenAIApi(configuration);

// Simple in-memory session store (for multi-turn conversations)
const sessions = {};

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!message) return res.json({ reply: "Please provide a message." });

    // Initialize session history if not exists
    if (!sessions[sessionId]) {
      sessions[sessionId] = [
        {
          role: "system",
          content:
            "You are Zeud, a helpful, friendly AI assistant. Answer questions accurately and concisely.",
        },
      ];
    }

    // Add user message to session
    sessions[sessionId].push({ role: "user", content: message });

    // Call OpenAI Chat API
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5",
      messages: sessions[sessionId],
    });

    const reply = completion.data.choices[0].message.content;

    // Save AI reply in session
    sessions[sessionId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err.response?.data || err.message);
    res.json({ reply: "⚠️ Error calling OpenAI API" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
