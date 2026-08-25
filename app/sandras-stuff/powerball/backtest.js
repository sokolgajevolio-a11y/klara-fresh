import { matchTicket } from "./engine";

export function backtestStrategy({ draws, strategy, warmup = 100, ticketsPerDraw = 1 }) {
  if (!Array.isArray(draws) || draws.length <= warmup) {
    throw new Error("Not enough historical draws for this backtest");
  }
  if (typeof strategy !== "function") throw new Error("strategy must be a function");

  const results = [];
  for (let i = warmup; i < draws.length; i++) {
    const history = draws.slice(0, i);
    const target = draws[i];
    const tickets = strategy({ history, count: ticketsPerDraw, targetIndex: i });
    for (const ticket of tickets) {
      results.push({ drawIndex: i, ticket, result: matchTicket(ticket, target) });
    }
  }
  return summarizeBacktest(results);
}

export function summarizeBacktest(results) {
  const buckets = {};
  let totalWhiteMatches = 0;
  let powerballHits = 0;
  for (const row of results) {
    const { whiteMatches, powerballMatch } = row.result;
    totalWhiteMatches += whiteMatches;
    if (powerballMatch) powerballHits += 1;
    const key = `${whiteMatches}+${powerballMatch ? "PB" : "0"}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return {
    ticketsTested: results.length,
    averageWhiteMatches: results.length ? totalWhiteMatches / results.length : 0,
    powerballHitRate: results.length ? powerballHits / results.length : 0,
    outcomes: buckets,
    rows: results,
  };
}

export function compareStrategies({ draws, candidates, baseline, warmup = 100, ticketsPerDraw = 1 }) {
  const all = { baseline: backtestStrategy({ draws, strategy: baseline, warmup, ticketsPerDraw }) };
  for (const [name, strategy] of Object.entries(candidates)) {
    all[name] = backtestStrategy({ draws, strategy, warmup, ticketsPerDraw });
  }
  return all;
}
