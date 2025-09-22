// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Initialize OpenAI with v5 SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory session store
const sessions = {};

/**
 * POST /chat
 * Body: { sessionId: string, message: string }
 * Response: { reply: string }
 */
app.post("/chat", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ reply: "⚠️ Missing sessionId or message" });
  }

  // Initialize session if it doesn't exist
  if (!sessions[sessionId]) sessions[sessionId] = [];

  // Add user message to session
  sessions[sessionId].push({ role: "user", content: message });

  try {
    // Call OpenAI Chat Completions
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // fallback if you don't have GPT-4 access
      messages: sessions[sessionId],
    });

    const reply = completion.choices[0].message.content;

    // Save assistant reply to session
    sessions[sessionId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ reply: "⚠️ Error calling OpenAI API" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Zeud Chatbot Backend is running 🚀");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
