import { fetchPowerballDataset } from "./powerball/source.server";
import { runLiveTournament } from "./powerball/run.server";
import { recommendTickets } from "./powerball/recommend.server";
import { rollingHoldoutValidation, weightSensitivityValidation, summarizeRobustness } from "./powerball/validation";
import { getForwardLedger, recordForwardPrediction, settleAvailablePredictions } from "./powerball/forward-ledger.server";

function isSandraShop(shop) {
  const allowed = (process.env.SANDRAS_STUFF_SHOP || "").trim().toLowerCase();
  return Boolean(allowed && String(shop || "").trim().toLowerCase() === allowed);
}

function nextPowerballDrawDate(latestDrawDate) {
  const d = new Date(`${latestDrawDate}T12:00:00Z`);
  const allowed = new Set([1, 3, 6]);
  do d.setUTCDate(d.getUTCDate() + 1); while (!allowed.has(d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

function hashText(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pixieDustTicket(drawDate) {
  let state = hashText(`SANDRA-PIXIE-DUST-${drawDate}`) || 1;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const white = new Set();
  while (white.size < 5) white.add(1 + Math.floor(random() * 69));
  return { white: [...white].sort((a, b) => a - b), powerball: 1 + Math.floor(random() * 26) };
}

function formatTicket(ticket, label) {
  return `${label}: ${ticket.white.join(" · ")} | Powerball ${ticket.powerball}`;
}

async function buildPowerballState(shop) {
  const draws = await fetchPowerballDataset();
  await settleAvailablePredictions({ shop, draws });
  const tournament = await runLiveTournament(draws);
  const holdouts = rollingHoldoutValidation({ draws });
  const sensitivity = weightSensitivityValidation({ draws });
  const robustness = summarizeRobustness({ holdouts, sensitivity });
  const recommendation = recommendTickets({ draws, tournament, robustness, count: 5 });
  const latestDraw = draws.at(-1)?.date;
  const nextDraw = latestDraw ? nextPowerballDrawDate(latestDraw) : null;
  const ledger = await getForwardLedger({ shop });
  return { draws, latestDraw, nextDraw, recommendation, robustness, ledger };
}

export function isSandrasStuffRequest(message) {
  const m = String(message || "").toLowerCase();
  return m.includes("sandra's stuff") || m.includes("sandras stuff") || m.includes("powerball") || m.includes("pixie dust") || m.includes("lottery picks") || m.includes("freeze these picks") || m.includes("track record");
}

export async function handleSandrasStuffChat({ message, shop }) {
  if (!isSandrasStuffRequest(message)) return null;
  if (!isSandraShop(shop)) return { reply: "Sandra's Stuff is private and is not available for this store.", intent: null };

  const m = String(message || "").trim().toLowerCase();
  if ((m.includes("sandra's stuff") || m.includes("sandras stuff")) && !m.includes("powerball")) {
    return {
      reply: "Sandra's Stuff\n\nPrivate tools:\n• Powerball Research\n\nSay “Powerball” or “give me Powerball picks” to open it here in KLARCI.",
      intent: null,
      sandrasStuff: { type: "MENU", tools: ["powerball"] },
    };
  }

  const state = await buildPowerballState(shop);
  const r = state.recommendation;

  if (m.includes("freeze")) {
    if (!state.nextDraw) return { reply: "I couldn't determine the next Powerball drawing date.", intent: null };
    try {
      await recordForwardPrediction({ shop, targetDrawDate: state.nextDraw, latestKnownDrawDate: state.latestDraw, recommendation: r });
      return { reply: `Frozen. I permanently recorded these picks for the ${state.nextDraw} drawing. I’ll compare them with the official result once it appears in the dataset.`, intent: null };
    } catch (error) {
      if (String(error?.code || "") === "P2002") return { reply: `The prediction for ${state.nextDraw} is already frozen.`, intent: null };
      throw error;
    }
  }

  if (m.includes("track record") || m.includes("performance") || m.includes("results")) {
    const s = state.ledger.summary;
    return {
      reply: `Powerball forward track record\n\nFrozen predictions: ${s.predictions}\nCompleted drawings: ${s.settledDraws}\nPrimary average white matches: ${s.primary.averageWhiteMatches.toFixed(3)}\nPrimary Powerball hit rate: ${(s.primary.powerballHitRate * 100).toFixed(2)}%\nExperimental average white matches: ${s.research.averageWhiteMatches.toFixed(3)}\nExperimental Powerball hit rate: ${(s.research.powerballHitRate * 100).toFixed(2)}%`,
      intent: null,
    };
  }

  const primary = r.tickets.map((t, i) => formatTicket(t, `${i + 1}`)).join("\n");
  const experimental = (r.researchTickets || []).map((t, i) => formatTicket(t, `${i + 1}`)).join("\n");
  const pixie = state.nextDraw ? pixieDustTicket(state.nextDraw) : null;
  const modelStatus = r.evidenceStatus === "robust-candidate-edge" ? "qualified experimental model" : "random baseline because no model currently proves a robust edge";

  let reply = `Powerball · next draw ${state.nextDraw}\n\nPRIMARY PICKS\nMethod: ${modelStatus}\n${primary}`;
  if (experimental) reply += `\n\nEXPERIMENTAL MODEL PICKS\n${experimental}`;
  if (pixie) reply += `\n\nPIXIE DUST\n${formatTicket(pixie, "Lucky line")}`;
  reply += `\n\nSay “freeze these picks” and I’ll permanently lock the primary and experimental selections before the drawing. Say “Powerball track record” to see forward performance.`;

  return {
    reply,
    intent: null,
    sandrasStuff: {
      type: "POWERBALL",
      nextDraw: state.nextDraw,
      primary: r.tickets,
      experimental: r.researchTickets || [],
      pixieDust: pixie,
      modelStatus: r.evidenceStatus,
    },
  };
}
