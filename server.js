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

// Conversation history (for demo purposes, global array; use sessions for multiple users)
let conversationHistory = [];

const systemPrompt = `
You are Zeud, a highly intelligent, friendly, and helpful AI assistant.
You can answer questions on any topic, provide advice, explain concepts clearly,
generate creative content, and help with problem-solving.
Always respond helpfully, conversationally, and politely.
`;

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "No message provided." });

    // Build messages array with system prompt + conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or "gpt-4" for more advanced responses
      messages,
    });

    const reply = completion.choices[0].message.content;

    // Update conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Error calling OpenAI API" });
  }
});

// Optional endpoint to clear conversation
app.post("/reset", (req, res) => {
  conversationHistory = [];
  res.json({ reply: "Conversation history cleared." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
