import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const OPENAI_MODELS = ["gpt-5.2"];
const ANTHROPIC_MODELS = ["claude-sonnet-4-5", "claude-sonnet-4-6"];
const GOOGLE_MODELS = ["gemini-3.1-pro-preview"];

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const API_SECRET = process.env.API_SECRET?.trim?.();
  if (!API_SECRET) return json(500, { error: "API_SECRET nije postavljen na serveru" });
  const key = req.headers.get("x-api-key")?.trim?.();
  if (!key || key !== API_SECRET) {
    return json(401, { error: "Nevažeći ili nedostajući API ključ" });
  }

  try {
    const body = await req.json();
    const { systemMsg, userContent, modelId } = body || {};
    if (!systemMsg || !userContent || !modelId) {
      return json(400, { error: "Nedostaju systemMsg, userContent ili modelId" });
    }

    let text = "";
    const MAX_TOKENS = 2048;

    if (OPENAI_MODELS.includes(modelId)) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return json(500, { error: "OPENAI_API_KEY nije postavljen u .env" });
      const openai = new OpenAI({ apiKey });
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
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return json(500, { error: "ANTHROPIC_API_KEY nije postavljen u .env" });
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: modelId,
        max_tokens: MAX_TOKENS,
        system: systemMsg,
        messages: [{ role: "user", content: userContent }],
      });
      const block = msg.content.find((b) => b.type === "text");
      text = block?.text?.trim?.() || "";
    } else if (GOOGLE_MODELS.includes(modelId)) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) return json(500, { error: "GOOGLE_GEMINI_API_KEY nije postavljen u .env" });
      const ai = new GoogleGenAI({ apiKey });
      const resp = await ai.models.generateContent({
        model: modelId,
        contents: `${systemMsg}\n\nUser: ${userContent}`,
        config: { maxOutputTokens: MAX_TOKENS },
      });
      text = resp.text?.trim?.() || "";
    } else {
      return json(400, { error: `Nepoznat model: ${modelId}` });
    }

    return json(200, { text });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message || "Greška na serveru" });
  }
}

export const config = {
  path: "/api/chat",
};
