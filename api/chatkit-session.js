import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    if (!openai.chatkit?.sessions?.create) {
      throw new Error(
        "OpenAI SDK missing ChatKit support. Bump the 'openai' package to the latest version.",
      );
    }

    const session = await openai.chatkit.sessions.create({
      // TODO: configure your ChatKit workflow/agent here
    });

    res.json({ client_secret: session.client_secret });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create ChatKit session",
      message: error?.message ?? String(error),
    });
  }
}
