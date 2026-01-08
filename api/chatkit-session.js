const API_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

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
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({
        error: "Missing OPENAI_API_KEY",
        message:
          "Set OPENAI_API_KEY in Vercel environment variables and redeploy.",
      });
      return;
    }

    let sessionConfig = {};
    if (process.env.CHATKIT_SESSION_CONFIG) {
      try {
        sessionConfig = JSON.parse(process.env.CHATKIT_SESSION_CONFIG);
      } catch (error) {
        res.status(500).json({
          error: "Invalid CHATKIT_SESSION_CONFIG",
          message: error?.message ?? String(error),
        });
        return;
      }
    } else {
      res.status(500).json({
        error: "Missing CHATKIT_SESSION_CONFIG",
        message:
          "Set CHATKIT_SESSION_CONFIG (JSON) in Vercel env vars to create a session.",
      });
      return;
    }

    const response = await fetch(`${API_BASE_URL}/chatkit/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(sessionConfig),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      res.status(response.status).json({
        error: "OpenAI API error",
        details: data,
      });
      return;
    }

    res.json({ client_secret: data.client_secret });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create ChatKit session",
      message: error?.message ?? String(error),
    });
  }
}
