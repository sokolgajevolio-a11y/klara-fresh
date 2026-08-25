import { backtestStrategy } from "./backtest";
import { createEnsembleStrategy } from "./lab";
import { mulberry32, pairedDifference } from "./experiment";
import { randomStrategy } from "./strategies";

function seeded(strategy, seed) {
  return (args) => strategy({ ...args, rng: mulberry32(seed + (args.targetIndex || 0)) });
}

export function rollingHoldoutValidation({ draws, trainMin = 300, holdoutSize = 100, step = 100, seed = 70000 }) {
  const results = [];
  for (let split = trainMin; split + holdoutSize <= draws.length; split += step) {
    const window = draws.slice(0, split + holdoutSize);
    const baseline = seeded(randomStrategy, seed + split);
    const ensemble = seeded(createEnsembleStrategy(), seed + split + 1);
    const baselineResult = backtestStrategy({ draws: window, strategy: baseline, warmup: split, ticketsPerDraw: 1 });
    const ensembleResult = backtestStrategy({ draws: window, strategy: ensemble, warmup: split, ticketsPerDraw: 1 });
    results.push({
      trainEndIndex: split - 1,
      holdoutStartIndex: split,
      holdoutEndIndex: split + holdoutSize - 1,
      comparison: pairedDifference(ensembleResult, baselineResult),
      baseline: baselineResult,
      ensemble: ensembleResult,
    });
  }
  return results;
}

const BASE_WEIGHTS = {
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
};

function perturbWeights(multiplierMap = {}) {
  return Object.fromEntries(Object.entries(BASE_WEIGHTS).map(([key, value]) => [key, value * (multiplierMap[key] ?? 1)]));
}

export function weightSensitivityValidation({ draws, warmup = 300, seed = 80000 }) {
  const variants = {
    base: BASE_WEIGHTS,
    lessFrequency: perturbWeights({ longFrequency: 0.7, shortFrequency: 0.7, mediumFrequency: 0.7 }),
    moreFrequency: perturbWeights({ longFrequency: 1.3, shortFrequency: 1.3, mediumFrequency: 1.3 }),
    lessRelations: perturbWeights({ pair: 0.6, triple: 0.6 }),
    moreRelations: perturbWeights({ pair: 1.4, triple: 1.4 }),
    lessGap: perturbWeights({ gap: 0.5, powerballGap: 0.5 }),
    moreGap: perturbWeights({ gap: 1.5, powerballGap: 1.5 }),
    lessShape: perturbWeights({ shape: 0.5 }),
    moreShape: perturbWeights({ shape: 1.5 }),
  };

  const baseline = backtestStrategy({
    draws,
    strategy: seeded(randomStrategy, seed),
    warmup,
    ticketsPerDraw: 1,
  });

  return Object.entries(variants).map(([name, weights], index) => {
    const strategy = seeded(createEnsembleStrategy({ weights }), seed + 100 + index);
    const result = backtestStrategy({ draws, strategy, warmup, ticketsPerDraw: 1 });
    return { name, weights, result, comparison: pairedDifference(result, baseline) };
  }).sort((a, b) => b.comparison.advantage - a.comparison.advantage);
}

export function summarizeRobustness({ holdouts, sensitivity }) {
  const holdoutPositive = holdouts.filter(x => x.comparison.advantage > 0).length;
  const holdoutCIClear = holdouts.filter(x => x.comparison.approximate95CI[0] > 0).length;
  const sensitivityPositive = sensitivity.filter(x => x.comparison.advantage > 0).length;
  return {
    holdoutWindows: holdouts.length,
    holdoutPositive,
    holdoutCIClear,
    sensitivityVariants: sensitivity.length,
    sensitivityPositive,
    robustCandidate: holdouts.length > 0 && holdoutCIClear >= Math.ceil(holdouts.length * 0.6) && sensitivityPositive >= Math.ceil(sensitivity.length * 0.7),
  };
}
