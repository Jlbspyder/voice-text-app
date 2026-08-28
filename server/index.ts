import "dotenv/config";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import Groq from "groq-sdk";

const port = Number(process.env.PORT ?? 3001);
const app = express();

class GroqAnswerError extends Error {
  constructor(public originalError: unknown) {
    super("Groq answer request failed");
  }
}

function getApiStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  const status = getApiStatus(error);
  if (status === 401)
    return "Groq rejected the API key. Check that it is active and copied completely.";
  if (status === 429)
    return "The Groq free-tier rate limit has been reached. Wait a moment and try again.";
  if (status === 404)
    return "The configured Groq answer model is not available to this account.";
  if (status === 400)
    return "Groq could not process this question. Please try a different question.";
  if (error instanceof Error && error.message.toLowerCase().includes("connection error"))
    return "The server could not connect to Groq.";
  return "The answer could not be generated. Please try again.";
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/ask-text", async (request, response, next) => {
  const question =
    typeof request.body?.question === "string" ? request.body.question.trim() : "";

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
    const messages = [
        {
          role: "system" as const,
          content:
            "Answer the user's question clearly and accurately. Be concise unless detail is needed. Do not ask a follow-up question.",
        },
        { role: "user" as const, content: question },
      ];
    const primaryModel = process.env.GROQ_TEXT_MODEL ?? "groq/compound";
    let result;
    try {
      result = await groq.chat.completions.create({ model: primaryModel, messages });
    } catch (error) {
      if (getApiStatus(error) !== 413 || !primaryModel.startsWith("groq/compound")) throw error;
      console.warn("Groq Compound returned 413; retrying with Compound Mini.");
      result = await groq.chat.completions.create({
        model: "groq/compound-mini",
        messages,
      });
    }
    const answer = result.choices[0]?.message.content?.trim();
    if (!answer) {
      response.status(502).json({ error: "Groq returned an empty answer. Please try again." });
      return;
    }
    response.json({ question, answer });
  } catch (error) {
    next(new GroqAnswerError(error));
  }
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    void _next;
    console.error(error);
    if (error instanceof GroqAnswerError) {
      const status = getApiStatus(error.originalError);
      response
        .status(status && status >= 400 && status < 500 ? status : 502)
        .json({ error: getErrorMessage(error.originalError) });
      return;
    }
    response.status(500).json({ error: "The request could not be processed." });
  },
);

app.listen(port, () => {
  console.log(`Voice API listening on http://localhost:${port}`);
});
