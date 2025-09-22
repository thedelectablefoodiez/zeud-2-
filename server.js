// server.js
import express from "express";
import cors from "cors";
import 'dotenv/config';
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 to ensure access
      messages: [
        {
          role: "system",
          content: "You are Zeud Chatbot, friendly, helpful, and can answer almost any question.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.json({ reply: "⚠️ Error calling OpenAI API" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
