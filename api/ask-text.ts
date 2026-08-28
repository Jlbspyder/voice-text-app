import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

function getGroqError(error: unknown) {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 502;

  if (status === 401)
    return { status, message: "Groq rejected the API key configured in Vercel." };
  if (status === 429)
    return { status, message: "The Groq free-tier rate limit has been reached. Wait a moment and try again." };
  if (status === 404)
    return { status, message: "The configured Groq model is not available to this account." };
  if (status === 400)
    return { status, message: "Groq could not process this question." };
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("timed out"))
      return { status: 504, message: "Groq took too long to answer. Please try again." };
    if (message.includes("connection") || message.includes("fetch failed"))
      return { status: 502, message: "The Vercel function temporarily could not connect to Groq. Please try again." };

    // Groq's SDK includes the upstream HTTP status and a useful description in
    // its Error. Keep that information visible while avoiding object dumps
    // which could contain request headers.
    const detail = error.message.replace(/\s+/g, " ").trim().slice(0, 300);
    return {
      status: status >= 400 && status <= 599 ? status : 502,
      message: `Groq answer request failed (HTTP ${status}): ${detail}`,
    };
  }
  return {
    status: status >= 400 && status <= 599 ? status : 502,
    message: `Groq answer request failed (HTTP ${status}). Please try again.`,
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const question =
    typeof request.body?.question === "string"
      ? request.body.question.trim()
      : "";

  if (!question) {
    response.status(400).json({ error: "Please include a transcribed question." });
    return;
  }
  if (question.length > 4_000) {
    response.status(400).json({ error: "The question is too long." });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "The server is missing its Groq API key." });
    return;
  }

  try {
    const groq = new Groq({ apiKey, maxRetries: 4, timeout: 60_000 });
    const result = await groq.chat.completions.create({
      model: process.env.GROQ_TEXT_MODEL ?? "groq/compound",
      messages: [
        {
          role: "system",
          content:
            "Answer the user's question clearly and accurately. Be concise unless detail is needed. Do not ask a follow-up question.",
        },
        { role: "user", content: question },
      ],
    });
    const answer = result.choices[0]?.message.content?.trim();
    if (!answer) {
      response.status(502).json({ error: "Groq returned an empty answer. Please try again." });
      return;
    }
    response.status(200).json({ question, answer });
  } catch (error) {
    const groqError = getGroqError(error);
    console.error("Groq answer request failed", error);
    response.status(groqError.status).json({ error: groqError.message });
  }
}
