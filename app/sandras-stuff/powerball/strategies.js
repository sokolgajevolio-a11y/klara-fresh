import { POWERBALL_RULES } from "./constants";
import { analyzeHistory, describeCombination } from "./engine";

const whitePool = () => Array.from({ length: 69 }, (_, i) => i + 1);
const pbPool = () => Array.from({ length: 26 }, (_, i) => i + 1);

function sampleWithoutReplacement(pool, count, rng = Math.random) {
  const copy = [...pool];
  const out = [];
  while (out.length < count && copy.length) {
    const index = Math.floor(rng() * copy.length);
    out.push(copy.splice(index, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}

function weightedSampleWithoutReplacement(items, weightFn, count, rng = Math.random) {
  const pool = items.map(item => ({ item, weight: Math.max(0.000001, Number(weightFn(item)) || 0.000001) }));
  const out = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((sum, x) => sum + x.weight, 0);
    let r = rng() * total;
    let chosen = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) { chosen = i; break; }
    }
    out.push(pool.splice(chosen, 1)[0].item);
  }
  return out.sort((a, b) => a - b);
}

function weightedSingle(items, weightFn, rng = Math.random) {
  const weighted = items.map(item => ({ item, weight: Math.max(0.000001, Number(weightFn(item)) || 0.000001) }));
  const total = weighted.reduce((sum, x) => sum + x.weight, 0);
  let r = rng() * total;
  for (const x of weighted) {
    r -= x.weight;
    if (r <= 0) return x.item;
  }
  return weighted.at(-1).item;
}

export function randomStrategy({ count = 1, rng = Math.random }) {
  return Array.from({ length: count }, () => ({
    white: sampleWithoutReplacement(whitePool(), POWERBALL_RULES.whiteBallCount, rng),
    powerball: 1 + Math.floor(rng() * POWERBALL_RULES.powerballMax),
  }));
}

export function frequencyWeightedStrategy({ history, count = 1, rng = Math.random }) {
  const { frequencies } = analyzeHistory(history);
  const smoothing = 1;
  return Array.from({ length: count }, () => ({
    white: weightedSampleWithoutReplacement(whitePool(), n => frequencies.white[n] + smoothing, 5, rng),
    powerball: weightedSingle(pbPool(), n => frequencies.powerball[n] + smoothing, rng),
  }));
}

export function recencyBalancedStrategy({ history, count = 1, rng = Math.random }) {
  const { gaps, frequencies } = analyzeHistory(history);
  return Array.from({ length: count }, () => ({
    white: weightedSampleWithoutReplacement(
      whitePool(),
      n => 1 + Math.log1p(gaps.white[n] ?? history.length) * 0.35 + Math.log1p(frequencies.white[n]) * 0.15,
      5,
      rng
    ),
    powerball: weightedSingle(
      pbPool(),
      n => 1 + Math.log1p(gaps.powerball[n] ?? history.length) * 0.35 + Math.log1p(frequencies.powerball[n]) * 0.15,
      rng
    ),
  }));
}

export function structureFilteredRandomStrategy({ count = 1, rng = Math.random, maxAttempts = 5000 }) {
  const accepted = [];
  let attempts = 0;
  while (accepted.length < count && attempts++ < maxAttempts) {
    const ticket = randomStrategy({ count: 1, rng })[0];
    const s = describeCombination(ticket.white);
    const reasonableParity = s.odd >= 1 && s.odd <= 4;
    const reasonableRange = s.low >= 1 && s.low <= 4;
    const reasonableSpan = s.span >= 24;
    const reasonableSum = s.sum >= 95 && s.sum <= 255;
    if (reasonableParity && reasonableRange && reasonableSpan && reasonableSum) accepted.push(ticket);
  }
  return accepted.length === count ? accepted : randomStrategy({ count, rng });
}

export function antiCrowdStrategy({ count = 1, rng = Math.random }) {
  const tickets = [];
  while (tickets.length < count) {
    const ticket = randomStrategy({ count: 1, rng })[0];
    const s = describeCombination(ticket.white);
    // This does not increase draw probability. It only aims to reduce the chance of splitting a prize
    // by avoiding combinations dominated by birthdays and obvious human-picked shapes.
    if (s.birthdayNumbers <= 2 && s.consecutivePairs <= 1) tickets.push(ticket);
  }
  return tickets;
}
