import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

// ─── Zaštita API-ja ──────────────────────────────────────────────────────────
const API_SECRET = process.env.API_SECRET?.trim?.();

const apiKeyAuth = (req, res, next) => {
  if (!API_SECRET) return res.status(500).json({ error: "API_SECRET nije postavljen na serveru" });
  const key = req.headers["x-api-key"]?.trim?.();
  if (!key || key !== API_SECRET) {
    return res.status(401).json({ error: "Nevažeći ili nedostajući API ključ" });
  }
  next();
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Previše zahteva. Pokušaj ponovo za minut." },
});

app.use("/api/chat", apiKeyAuth, limiter);

// ─── Modeli ───────────────────────────────────────────────────────────────────
const OPENAI_MODELS = ["gpt-5.2"];
const ANTHROPIC_MODELS = ["claude-sonnet-4-5", "claude-sonnet-4-6"];
const GOOGLE_MODELS = ["gemini-3.1-pro-preview"];

app.post("/api/chat", async (req, res) => {
  try {
    const { systemMsg, userContent, modelId } = req.body;
    if (!systemMsg || !userContent || !modelId) {
      return res.status(400).json({ error: "Nedostaju systemMsg, userContent ili modelId" });
    }

    let text = "";

    const MAX_TOKENS = 2048;

    if (OPENAI_MODELS.includes(modelId)) {
      const key = process.env.OPENAI_API_KEY;
      if (!key) return res.status(500).json({ error: "OPENAI_API_KEY nije postavljen u .env" });
      const openai = new OpenAI({ apiKey: key });
      const tokenParam = modelId.startsWith("gpt-5") ? { max_completion_tokens: MAX_TOKENS } : { max_tokens: MAX_TOKENS };
      const completion = await openai.chat.completions.create({
        model: modelId,
        ...tokenParam,
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userContent },
        ],
      });
      text = completion.choices?.[0]?.message?.content?.trim?.() || "";
    } else if (ANTHROPIC_MODELS.includes(modelId)) {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY nije postavljen u .env" });
      const anthropic = new Anthropic({ apiKey: key });
      const msg = await anthropic.messages.create({
        model: modelId,
        max_tokens: MAX_TOKENS,
        system: systemMsg,
        messages: [{ role: "user", content: userContent }],
      });
      const block = msg.content.find((b) => b.type === "text");
      text = block?.text?.trim?.() || "";
    } else if (GOOGLE_MODELS.includes(modelId)) {
      const key = process.env.GOOGLE_GEMINI_API_KEY;
      if (!key) return res.status(500).json({ error: "GOOGLE_GEMINI_API_KEY nije postavljen u .env" });
      const ai = new GoogleGenAI({ apiKey: key });
      const resp = await ai.models.generateContent({
        model: modelId,
        contents: `${systemMsg}\n\nUser: ${userContent}`,
        config: { maxOutputTokens: MAX_TOKENS },
      });
      text = resp.text?.trim?.() || "";
    } else {
      return res.status(400).json({ error: `Nepoznat model: ${modelId}` });
    }

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Greška na serveru" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend na http://localhost:${PORT}`));
