// Statistical evaluation helpers for comparing a candidate strategy with random play.
// These metrics deliberately avoid claiming predictive power from a few lucky hits.

export function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function variance(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((sum, x) => sum + (x - m) ** 2, 0) / (values.length - 1);
}

export function summarizeMatchRows(rows) {
  const white = rows.map(r => r.result.whiteMatches);
  const pb = rows.map(r => Number(r.result.powerballMatch));
  return {
    n: rows.length,
    meanWhiteMatches: mean(white),
    whiteMatchVariance: variance(white),
    powerballRate: mean(pb),
    threePlusWhiteRate: mean(white.map(x => Number(x >= 3))),
    fourPlusWhiteRate: mean(white.map(x => Number(x >= 4))),
  };
}

export function pairedAdvantage(candidateRows, baselineRows) {
  const n = Math.min(candidateRows.length, baselineRows.length);
  if (!n) return null;
  const diffs = [];
  for (let i = 0; i < n; i++) {
    const c = candidateRows[i].result;
    const b = baselineRows[i].result;
    // White-ball matches dominate this diagnostic; PB adds a small independent signal.
    diffs.push((c.whiteMatches - b.whiteMatches) + 0.2 * (Number(c.powerballMatch) - Number(b.powerballMatch)));
  }
  const avg = mean(diffs);
  const sd = Math.sqrt(variance(diffs));
  const se = sd / Math.sqrt(n);
  return {
    pairedSamples: n,
    meanAdvantage: avg,
    standardError: se,
    zApprox: se ? avg / se : 0,
    // 95% normal-approximation interval; useful as a screening diagnostic, not proof.
    interval95: [avg - 1.96 * se, avg + 1.96 * se],
  };
}

export function rankTournament(results) {
  return Object.entries(results)
    .map(([name, result]) => ({ name, ...summarizeMatchRows(result.rows || []) }))
    .sort((a, b) => b.meanWhiteMatches - a.meanWhiteMatches);
}
