import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

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
    const groq = new Groq({ apiKey });
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
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 502;
    console.error("Groq answer request failed", error);
    response.status(status >= 400 && status < 500 ? status : 502).json({
      error: "The answer could not be generated. Please try again.",
    });
  }
}
