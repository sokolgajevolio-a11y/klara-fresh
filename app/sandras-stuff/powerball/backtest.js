import { matchTicket } from "./engine";

export function backtestStrategy({ draws, strategy, warmup = 100, ticketsPerDraw = 1, rng = Math.random }) {
  if (!Array.isArray(draws) || draws.length <= warmup) {
    throw new Error("Not enough historical draws for this backtest");
  }
  if (typeof strategy !== "function") throw new Error("strategy must be a function");

  const results = [];
  for (let i = warmup; i < draws.length; i++) {
    const history = draws.slice(0, i);
    const target = draws[i];
    const tickets = strategy({ history, count: ticketsPerDraw, targetIndex: i, rng });
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
  let threePlus = 0;
  let fourPlus = 0;

  for (const row of results) {
    const { whiteMatches, powerballMatch } = row.result;
    totalWhiteMatches += whiteMatches;
    if (powerballMatch) powerballHits += 1;
    if (whiteMatches >= 3) threePlus += 1;
    if (whiteMatches >= 4) fourPlus += 1;
    const key = `${whiteMatches}+${powerballMatch ? "PB" : "0"}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }

  const n = results.length;
  return {
    ticketsTested: n,
    averageWhiteMatches: n ? totalWhiteMatches / n : 0,
    powerballHitRate: n ? powerballHits / n : 0,
    threePlusRate: n ? threePlus / n : 0,
    fourPlusRate: n ? fourPlus / n : 0,
    outcomes: buckets,
    rows: results,
  };
}

export function compareStrategies({ draws, candidates, baseline, warmup = 100, ticketsPerDraw = 1, rng = Math.random }) {
  const all = { baseline: backtestStrategy({ draws, strategy: baseline, warmup, ticketsPerDraw, rng }) };
  for (const [name, strategy] of Object.entries(candidates)) {
    all[name] = backtestStrategy({ draws, strategy, warmup, ticketsPerDraw, rng });
  }
  return all;
}
