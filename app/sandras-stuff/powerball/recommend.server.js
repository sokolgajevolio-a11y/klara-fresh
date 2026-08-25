import {
  antiCrowdStrategy,
  frequencyWeightedStrategy,
  randomStrategy,
  recencyBalancedStrategy,
  structureFilteredRandomStrategy,
} from "./strategies";
import { createEnsembleStrategy } from "./lab";
import { mulberry32 } from "./experiment";

const STRATEGIES = {
  frequencyWeighted: frequencyWeightedStrategy,
  recencyBalanced: recencyBalancedStrategy,
  structureFiltered: structureFilteredRandomStrategy,
  antiCrowd: antiCrowdStrategy,
  ensemble: createEnsembleStrategy(),
};

function aggregateEvidence(tournament) {
  const scores = new Map();
  for (const window of tournament) {
    for (const row of window.ranking) {
      const entry = scores.get(row.name) || { name: row.name, advantages: [], lowerBounds: [], upperBounds: [] };
      entry.advantages.push(row.comparison.advantage);
      entry.lowerBounds.push(row.comparison.approximate95CI[0]);
      entry.upperBounds.push(row.comparison.approximate95CI[1]);
      scores.set(row.name, entry);
    }
  }
  return [...scores.values()].map(x => ({
    name: x.name,
    meanAdvantage: x.advantages.reduce((a, b) => a + b, 0) / x.advantages.length,
    worstLowerBound: Math.min(...x.lowerBounds),
    bestUpperBound: Math.max(...x.upperBounds),
    consistentlyPositive: x.lowerBounds.every(v => v > 0),
  })).sort((a, b) => b.meanAdvantage - a.meanAdvantage);
}

export function recommendTickets({ draws, tournament, robustness, count = 5, seed = 20260825 }) {
  const evidence = aggregateEvidence(tournament);
  const robust = Boolean(robustness?.robustCandidate);
  const ensembleEvidence = evidence.find(x => x.name === "ensemble");
  const ensembleQualified = robust && Boolean(ensembleEvidence?.consistentlyPositive);

  const selectedName = ensembleQualified ? "ensemble" : "random";
  const selectedStrategy = ensembleQualified ? STRATEGIES.ensemble : randomStrategy;
  const rng = mulberry32(seed);
  const tickets = selectedStrategy({ history: draws, count, rng });

  return {
    selectedStrategy: selectedName,
    evidenceStatus: ensembleQualified ? "robust-candidate-edge" : "no-robust-demonstrated-edge",
    explanation: ensembleQualified
      ? "The ensemble passed the current robustness gate and has consistently positive tested intervals. It remains experimental and does not change the underlying randomness of a valid Powerball draw."
      : "No model currently passes the full robustness gate. Primary candidate tickets therefore use the random baseline; model-based tickets remain research-only.",
    researchOnlyStrategy: ensembleQualified ? null : "ensemble",
    robustnessRequired: true,
    evidence,
    tickets,
  };
}
