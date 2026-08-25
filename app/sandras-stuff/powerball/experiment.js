import { backtestStrategy } from "./backtest";

// Deterministic PRNG keeps experiments reproducible.
export function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function sampleVariance(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

export function pairedDifference(candidate, baseline) {
  const n = Math.min(candidate.rows.length, baseline.rows.length);
  const differences = [];
  for (let i = 0; i < n; i++) {
    const a = candidate.rows[i].result;
    const b = baseline.rows[i].result;
    // White matches dominate; PB match is tracked as a separate bonus dimension.
    differences.push((a.whiteMatches - b.whiteMatches) + 0.25 * ((a.powerballMatch ? 1 : 0) - (b.powerballMatch ? 1 : 0)));
  }
  const advantage = mean(differences);
  const variance = sampleVariance(differences);
  const standardError = n ? Math.sqrt(variance / n) : 0;
  return {
    n,
    advantage,
    standardError,
    approximate95CI: [advantage - 1.96 * standardError, advantage + 1.96 * standardError],
  };
}

export function runTournament({ draws, baseline, strategies, warmup = 100, ticketsPerDraw = 1 }) {
  const baselineResult = backtestStrategy({ draws, strategy: baseline, warmup, ticketsPerDraw });
  const results = [];
  for (const [name, strategy] of Object.entries(strategies)) {
    const result = backtestStrategy({ draws, strategy, warmup, ticketsPerDraw });
    const comparison = pairedDifference(result, baselineResult);
    results.push({ name, result, comparison });
  }
  results.sort((a, b) => b.comparison.advantage - a.comparison.advantage);
  return {
    baseline: baselineResult,
    ranking: results,
    interpretation: "A positive score alone is not evidence of prediction. Require stability across windows/seeds and a confidence interval that does not depend on one lucky draw.",
  };
}

export function rollingRobustness({ draws, baseline, strategies, warmups = [100, 200, 300], ticketsPerDraw = 1 }) {
  return warmups
    .filter(warmup => draws.length > warmup)
    .map(warmup => ({ warmup, tournament: runTournament({ draws, baseline, strategies, warmup, ticketsPerDraw }) }));
}
