import { analyzeHistory, describeCombination } from "./engine";
import { POWERBALL_RULES } from "./constants";

const whitePool = Array.from({ length: POWERBALL_RULES.whiteBallMax }, (_, i) => i + 1);
const pbPool = Array.from({ length: POWERBALL_RULES.powerballMax }, (_, i) => i + 1);

function zscore(valuesByKey) {
  const entries = Object.entries(valuesByKey).map(([k, v]) => [k, Number(v) || 0]);
  const xs = entries.map(([, v]) => v);
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, xs.length - 1);
  const sd = Math.sqrt(variance) || 1;
  return Object.fromEntries(entries.map(([k, v]) => [k, (v - mean) / sd]));
}

function tripleTable(draws) {
  const map = new Map();
  for (const draw of draws) {
    const w = [...draw.white].sort((a, b) => a - b);
    for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++) for (let k = j + 1; k < w.length; k++) {
      const key = `${w[i]}-${w[j]}-${w[k]}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map;
}

function rollingFrequency(draws, windowSize) {
  const recent = draws.slice(-windowSize);
  const analysis = analyzeHistory(recent);
  return analysis.frequencies;
}

export function buildFeatureState(history) {
  const full = analyzeHistory(history);
  const f25 = rollingFrequency(history, Math.min(25, history.length));
  const f100 = rollingFrequency(history, Math.min(100, history.length));
  const whiteFullZ = zscore(full.frequencies.white);
  const white25Z = zscore(f25.white);
  const white100Z = zscore(f100.white);
  const gapZ = zscore(Object.fromEntries(whitePool.map(n => [n, full.gaps.white[n] ?? history.length])));
  const pbFullZ = zscore(full.frequencies.powerball);
  const pbGapZ = zscore(Object.fromEntries(pbPool.map(n => [n, full.gaps.powerball[n] ?? history.length])));
  return { full, whiteFullZ, white25Z, white100Z, gapZ, pbFullZ, pbGapZ, triples: tripleTable(history) };
}

function pairScore(numbers, pairTable) {
  let score = 0;
  for (let i = 0; i < numbers.length; i++) for (let j = i + 1; j < numbers.length; j++) {
    score += pairTable[`${numbers[i]}-${numbers[j]}`] || 0;
  }
  return score;
}

function tripleScore(numbers, triples) {
  let score = 0;
  for (let i = 0; i < numbers.length; i++) for (let j = i + 1; j < numbers.length; j++) for (let k = j + 1; k < numbers.length; k++) {
    score += triples.get(`${numbers[i]}-${numbers[j]}-${numbers[k]}`) || 0;
  }
  return score;
}

function shapeScore(numbers, historicalShapes) {
  const s = describeCombination(numbers);
  const features = ["sum", "span", "odd", "low", "consecutivePairs"];
  let total = 0;
  for (const feature of features) {
    const xs = historicalShapes.map(x => x[feature]);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const variance = xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / Math.max(1, xs.length - 1);
    const sd = Math.sqrt(variance) || 1;
    total -= Math.abs((s[feature] - mean) / sd);
  }
  return total;
}

export function scoreTicket(ticket, state, weights = {}) {
  const w = {
    longFrequency: 0.18,
    shortFrequency: 0.18,
    mediumFrequency: 0.12,
    gap: 0.12,
    pair: 0.14,
    triple: 0.08,
    shape: 0.10,
    antiCrowd: 0.08,
    powerballFrequency: 0.50,
    powerballGap: 0.50,
    ...weights,
  };
  const numbers = [...ticket.white].sort((a, b) => a - b);
  const whiteScore = numbers.reduce((sum, n) => sum +
    w.longFrequency * state.whiteFullZ[n] +
    w.shortFrequency * state.white25Z[n] +
    w.mediumFrequency * state.white100Z[n] +
    w.gap * state.gapZ[n], 0);
  const relations = w.pair * Math.log1p(pairScore(numbers, state.full.pairs)) + w.triple * Math.log1p(tripleScore(numbers, state.triples));
  const shape = w.shape * shapeScore(numbers, state.full.shapes);
  const birthdayCount = numbers.filter(n => n <= 31).length;
  const antiCrowd = w.antiCrowd * Math.max(0, birthdayCount - 2) * -1;
  const pb = w.powerballFrequency * state.pbFullZ[ticket.powerball] + w.powerballGap * state.pbGapZ[ticket.powerball];
  return whiteScore + relations + shape + antiCrowd + pb;
}

export function createEnsembleStrategy({ candidateGenerator, weights } = {}) {
  return function ensembleStrategy({ history, count = 1, rng = Math.random }) {
    const state = buildFeatureState(history);
    const generate = candidateGenerator || (({ count: n, rng: random }) => Array.from({ length: n }, () => {
      const pool = [...whitePool];
      const white = [];
      while (white.length < 5) white.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
      return { white: white.sort((a, b) => a - b), powerball: 1 + Math.floor(random() * 26) };
    }));
    const candidateCount = Math.max(500, count * 250);
    const candidates = generate({ history, count: candidateCount, rng });
    return candidates
      .map(ticket => ({ ticket, score: scoreTicket(ticket, state, weights) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(x => x.ticket);
  };
}
