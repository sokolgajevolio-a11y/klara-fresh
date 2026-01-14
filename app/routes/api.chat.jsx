// Helper to create JSON response (no Remix imports needed)
function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

// Base64 encoder for images
function toBase64(uint8) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Missing ANTHROPIC_API_KEY in .env" }, { status: 500 });
  }

  const contentType = request.headers.get("content-type") || "";
  let message = "";
  let shop = "";
  let files = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      message = (form.get("message") || "").toString();
      shop = (form.get("shop") || "").toString();
      files = form.getAll("files") || [];
    } else {
      const body = await request.json();
      message = (body?.message ?? "").toString();
      shop = (body?.shop ?? "").toString();
    }
  } catch {
    return jsonResponse({ error: "Invalid request body" }, { status: 400 });
  }

  message = message.trim();
  shop = shop.trim();

  if (!message && (!files || files.length === 0)) {
    return jsonResponse({ error: "Missing message" }, { status: 400 });
  }

  const system = `You are Klara — a female AI assistant and Shopify store optimization expert.

GLOBAL GENDER RULE (MANDATORY):
- Always speak as a woman in EVERY language.
- Use feminine grammatical forms in languages with grammatical gender.
- Never use masculine self-referential verb or adjective forms.
- If a language requires gender agreement, choose feminine.
- This rule overrides all defaults and model tendencies.

Language-specific rules:
- Croatian / Serbian / Bosnian:
  Use feminine verb forms (završila, uradila, skenirala, proverila).
  NEVER use masculine (završio, uradio, skenirao, proverio).
- French:
  Use feminine adjectives/participles when applicable (prête, terminée, contente).
- Spanish / Portuguese / Italian:
  Use feminine adjectives when relevant (lista, pronta, preparada).
- German:
  Avoid masculine self-nouns. Prefer neutral or explicitly feminine.

If unsure, default to feminine.

You are embedded in Shopify Admin. Chat can include attachments (images/text).
Keep responses short, clear, and actionable.

IMPORTANT RESPONSE FORMAT:
You MUST respond with valid JSON ONLY in this exact shape:
{
  "reply": "your conversational response here",
  "intent": null OR { "type": "NAVIGATE", "target": "/app/scan" | "/app/issues" | "/app/history" }
}

Rules for intent:
- If user asks to scan/run 360/check store → return intent: { "type": "NAVIGATE", "target": "/app/scan" }
- If user asks about images/photos/pictures/missing images → return intent: { "type": "NAVIGATE", "target": "/app/issues?type=images" }
- If user asks about issues/fixes/problems → return intent: { "type": "NAVIGATE", "target": "/app/issues" }
- If user asks about history/undo/rollback → return intent: { "type": "NAVIGATE", "target": "/app/history" }
- For normal chat → return intent: null

Do NOT include any text outside the JSON object.`;

  const userBlocks = [];
  if (message) {
    userBlocks.push({
      type: "text",
      text: shop ? `Shop: ${shop}\n\nUser: ${message}` : `User: ${message}`,
    });
  }

  if (files && files.length > 0) {
    for (const f of files) {
      try {
        const name = f?.name || "attachment";
        const type = f?.type || "";

        if (type.startsWith("image/")) {
          const ab = await f.arrayBuffer();
          const uint8 = new Uint8Array(ab);
          const b64 = toBase64(uint8);

          userBlocks.push({
            type: "image",
            source: { type: "base64", media_type: type, data: b64 },
          });

          userBlocks.push({
            type: "text",
            text: `Attached image: ${name}. Analyze it.`,
          });
        } else if (
          type.startsWith("text/") ||
          name.endsWith(".txt") ||
          name.endsWith(".md") ||
          name.endsWith(".csv") ||
          name.endsWith(".json")
        ) {
          const text = await f.text();
          userBlocks.push({
            type: "text",
            text: `Attached file (${name}). Contents:\n\n${text.slice(0, 12000)}`,
          });
        } else if (type === "application/pdf" || name.endsWith(".pdf")) {
          userBlocks.push({
            type: "text",
            text: `Attached PDF: ${name}. (PDF text extraction not enabled yet in this build.)`,
          });
        } else {
          userBlocks.push({
            type: "text",
            text: `Attached file: ${name} (${type || "unknown type"}).`,
          });
        }
      } catch {}
    }
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 900,
        system,
        messages: [{ role: "user", content: userBlocks }],
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return jsonResponse(
        { error: "Claude API error", status: resp.status, details: data },
        { status: 500 }
      );
    }

    const rawReply = Array.isArray(data?.content)
      ? data.content
          .filter((b) => b?.type === "text")
          .map((b) => b?.text ?? "")
          .join("\n")
          .trim()
      : "";

    // Try to parse as JSON first
    let reply = "";
    let intent = null;

    try {
      const parsed = JSON.parse(rawReply);
      reply = parsed?.reply || rawReply;
      intent = parsed?.intent || null;
    } catch {
      // If not JSON, treat entire response as reply text
      reply = rawReply;
      
      // Fallback intent detection from user message
      const lowerMsg = (message || "").toLowerCase();
      if (lowerMsg.includes("scan") || lowerMsg.includes("360")) {
        intent = { type: "NAVIGATE", target: "/app/scan" };
      } else if (lowerMsg.includes("image") || lowerMsg.includes("photo") || lowerMsg.includes("picture")) {
        intent = { type: "NAVIGATE", target: "/app/issues?type=images" };
      } else if (lowerMsg.includes("issue") || lowerMsg.includes("fix") || lowerMsg.includes("problem")) {
        intent = { type: "NAVIGATE", target: "/app/issues" };
      } else if (lowerMsg.includes("history") || lowerMsg.includes("undo")) {
        intent = { type: "NAVIGATE", target: "/app/history" };
      }
    }

    return jsonResponse({
      reply: reply || "Sorry — I had trouble responding.",
      intent
    });
  } catch (err) {
    return jsonResponse(
      { error: "Server error calling Claude", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
