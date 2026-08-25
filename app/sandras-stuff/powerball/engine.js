import { POWERBALL_RULES } from "./constants";

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

export function normalizeDraw(draw) {
  if (!draw) throw new Error("Draw is required");
  const white = [...(draw.white || draw.whiteBalls || [])].map(Number).sort((a, b) => a - b);
  const powerball = Number(draw.powerball);
  if (white.length !== POWERBALL_RULES.whiteBallCount || new Set(white).size !== white.length) {
    throw new Error("A Powerball draw must contain five unique white balls");
  }
  if (white.some(n => n < 1 || n > 69) || powerball < 1 || powerball > 26) {
    throw new Error("Draw contains an out-of-range number");
  }
  return { ...draw, white, powerball };
}

export function buildFrequencyTable(draws) {
  const white = Object.fromEntries(range(1, 69).map(n => [n, 0]));
  const powerball = Object.fromEntries(range(1, 26).map(n => [n, 0]));
  for (const raw of draws) {
    const draw = normalizeDraw(raw);
    for (const n of draw.white) white[n] += 1;
    powerball[draw.powerball] += 1;
  }
  return { white, powerball, drawCount: draws.length };
}

export function buildGapTable(draws) {
  const white = Object.fromEntries(range(1, 69).map(n => [n, null]));
  const powerball = Object.fromEntries(range(1, 26).map(n => [n, null]));
  const ordered = [...draws].reverse();
  ordered.forEach((raw, index) => {
    const draw = normalizeDraw(raw);
    for (const n of draw.white) if (white[n] === null) white[n] = index;
    if (powerball[draw.powerball] === null) powerball[draw.powerball] = index;
  });
  return { white, powerball };
}

export function buildPairTable(draws) {
  const pairs = new Map();
  for (const raw of draws) {
    const { white } = normalizeDraw(raw);
    for (let i = 0; i < white.length; i++) {
      for (let j = i + 1; j < white.length; j++) {
        const key = `${white[i]}-${white[j]}`;
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  }
  return Object.fromEntries([...pairs.entries()].sort((a, b) => b[1] - a[1]));
}

export function describeCombination(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const odd = sorted.filter(n => n % 2).length;
  const low = sorted.filter(n => n <= 34).length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const gaps = sorted.slice(1).map((n, i) => n - sorted[i]);
  return {
    numbers: sorted,
    sum,
    odd,
    even: sorted.length - odd,
    low,
    high: sorted.length - low,
    span: sorted.at(-1) - sorted[0],
    meanGap: gaps.reduce((a, b) => a + b, 0) / gaps.length,
    consecutivePairs: gaps.filter(g => g === 1).length,
    birthdayNumbers: sorted.filter(n => n <= 31).length,
  };
}

export function analyzeHistory(draws) {
  const normalized = draws.map(normalizeDraw);
  return {
    draws: normalized.length,
    frequencies: buildFrequencyTable(normalized),
    gaps: buildGapTable(normalized),
    pairs: buildPairTable(normalized),
    shapes: normalized.map(d => describeCombination(d.white)),
  };
}

export function matchTicket(ticket, draw) {
  const t = normalizeDraw(ticket);
  const d = normalizeDraw(draw);
  const winning = new Set(d.white);
  return {
    whiteMatches: t.white.filter(n => winning.has(n)).length,
    powerballMatch: t.powerball === d.powerball,
  };
}
