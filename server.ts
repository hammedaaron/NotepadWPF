import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Copilot AI API Endpoint
app.post("/api/copilot", async (req, res) => {
  try {
    const { action, text, prompt, context } = req.body;

    if (!text && !prompt) {
      return res.status(400).json({ error: "Text or prompt is required" });
    }

    const ai = getGenAI();

    let systemInstruction = "You are a professional writing and document editing assistant in a Microsoft Word / Notes text editor. Return clean, polished, direct output without conversational filler or meta commentary unless explicitly asked.";
    let userPrompt = "";

    switch (action) {
      case "rewrite":
        userPrompt = `Rewrite the following text to make it clear, elegant, and professional:\n\n${text}`;
        break;
      case "tone_formal":
        userPrompt = `Rewrite the following text with an executive, formal business tone:\n\n${text}`;
        break;
      case "tone_casual":
        userPrompt = `Rewrite the following text in a friendly, conversational, and accessible tone:\n\n${text}`;
        break;
      case "shorten":
        userPrompt = `Make the following text more concise and punchy while retaining all key points:\n\n${text}`;
        break;
      case "expand":
        userPrompt = `Elaborate and expand on the following text with rich detail, supporting explanations, and structured paragraphs:\n\n${text}`;
        break;
      case "grammar":
        userPrompt = `Fix all spelling, punctuation, typos, and grammatical errors in the following text. Preserve original meaning and formatting:\n\n${text}`;
        break;
      case "summarize":
        userPrompt = `Provide a well-structured summary of the following document with key takeaways and bullet points:\n\n${text}`;
        break;
      case "explain":
        userPrompt = `Explain the following text clearly, providing background context and key insights:\n\n${text}`;
        break;
      case "generate_table":
        userPrompt = `Generate a markdown/HTML compatible data table based on the following request:\n${prompt || text}`;
        break;
      case "custom":
      default:
        userPrompt = prompt ? `${prompt}\n\nContext:\n${text || ""}` : text;
        break;
    }

    if (!ai) {
      // Offline / Fallback Intelligent Processor
      let simulatedResult = "";
      if (action === "grammar") {
        simulatedResult = text.trim()
          .replace(/\bi\b/g, "I")
          .replace(/\bteh\b/gi, "the")
          .replace(/\brecieve\b/gi, "receive")
          .replace(/\bseperate\b/gi, "separate")
          .replace(/\buntill\b/gi, "until")
          .replace(/\s+/g, " ");
        if (simulatedResult && !/[.!?]$/.test(simulatedResult)) simulatedResult += ".";
      } else if (action === "summarize") {
        const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
        const topSentences = sentences.slice(0, 3).map((s: string) => `• ${s.trim()}`).join("\n");
        simulatedResult = `### Summary\n${topSentences || "• " + text.slice(0, 120) + "..."}`;
      } else if (action === "tone_formal") {
        simulatedResult = text
          .replace(/can't/g, "cannot")
          .replace(/don't/g, "do not")
          .replace(/won't/g, "will not")
          .replace(/it's/g, "it is")
          .replace(/gonna/g, "going to");
      } else if (action === "shorten") {
        const words = text.split(/\s+/);
        simulatedResult = words.slice(0, Math.max(5, Math.floor(words.length * 0.6))).join(" ") + (words.length > 5 ? "." : "");
      } else {
        simulatedResult = `[Draft] ${text}`;
      }

      return res.json({
        result: simulatedResult,
        model: "offline-rule-engine",
        notice: "Gemini API key not configured. Using built-in local writing assistant engine."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || "";
    return res.json({
      result: outputText,
      model: "gemini-3.7-flash"
    });
  } catch (error: any) {
    console.error("Error in /api/copilot:", error);
    return res.status(500).json({ error: error.message || "Failed to process request" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
