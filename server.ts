import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Mistral } from "@mistralai/mistralai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MODEL = "mistral-small-latest";
const MAX_HISTORY = 20;

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  console.error("Falta MISTRAL_API_KEY. Defínela en tu entorno o en un archivo .env");
  process.exit(1);
}

const client = new Mistral({ apiKey });

const app = express();
app.use(express.json());

type ChatMessage = { role: "user" | "assistant"; content: string };

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/chat", async (req, res) => {
  const history: unknown = req.body?.messages;
  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: "Se requiere un array 'messages' no vacío." });
    return;
  }

  const messages: ChatMessage[] = history
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (m as ChatMessage).role &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
    .slice(-MAX_HISTORY);

  if (messages.length === 0) {
    res.status(400).json({ error: "No hay mensajes válidos en la petición." });
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await client.chat.stream({
      model: MODEL,
      messages,
    });

    for await (const event of stream) {
      const delta = event.data.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
  } catch (err) {
    console.error("Error llamando a la API de Mistral:", err);
    if (!res.headersSent) {
      res.status(502).json({ error: "Error llamando a la API de Mistral." });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: "Error llamando a la API de Mistral." })}\n\n`);
  } finally {
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
