import { matchTicket } from "./engine";

export function createPredictionSnapshot({ targetDrawDate, generatedAt, latestKnownDrawDate, recommendation }) {
  if (!targetDrawDate) throw new Error("targetDrawDate is required");
  if (!generatedAt) throw new Error("generatedAt is required");
  if (latestKnownDrawDate && targetDrawDate <= latestKnownDrawDate) {
    throw new Error("Forward prediction must target a draw later than the latest known result");
  }

  return Object.freeze({
    version: 1,
    targetDrawDate,
    generatedAt,
    latestKnownDrawDate: latestKnownDrawDate || null,
    selectedStrategy: recommendation.selectedStrategy,
    evidenceStatus: recommendation.evidenceStatus,
    primaryTickets: recommendation.tickets.map(ticket => ({ white: [...ticket.white], powerball: ticket.powerball })),
    researchTickets: (recommendation.researchTickets || []).map(ticket => ({ white: [...ticket.white], powerball: ticket.powerball })),
  });
}

export function settlePredictionSnapshot(snapshot, actualDraw) {
  if (!snapshot || !actualDraw) throw new Error("Snapshot and actual draw are required");
  if (snapshot.targetDrawDate !== actualDraw.date) throw new Error("Actual draw date does not match prediction target");

  const score = tickets => tickets.map(ticket => ({ ticket, result: matchTicket(ticket, actualDraw) }));
  return {
    ...snapshot,
    settled: true,
    actualDraw: { date: actualDraw.date, white: [...actualDraw.white], powerball: actualDraw.powerball },
    primaryResults: score(snapshot.primaryTickets),
    researchResults: score(snapshot.researchTickets),
  };
}

export function summarizeForwardLedger(entries) {
  const settled = entries.filter(entry => entry.settled);
  const summarize = key => {
    const rows = settled.flatMap(entry => entry[key] || []);
    if (!rows.length) return { tickets: 0, averageWhiteMatches: 0, powerballHitRate: 0, threePlusRate: 0 };
    const white = rows.reduce((sum, row) => sum + row.result.whiteMatches, 0);
    const pb = rows.filter(row => row.result.powerballMatch).length;
    const threePlus = rows.filter(row => row.result.whiteMatches >= 3).length;
    return {
      tickets: rows.length,
      averageWhiteMatches: white / rows.length,
      powerballHitRate: pb / rows.length,
      threePlusRate: threePlus / rows.length,
    };
  };

  return {
    predictions: entries.length,
    settledDraws: settled.length,
    primary: summarize("primaryResults"),
    research: summarize("researchResults"),
  };
}
