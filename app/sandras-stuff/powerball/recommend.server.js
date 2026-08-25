import {
  antiCrowdStrategy,
  frequencyWeightedStrategy,
  randomStrategy,
  recencyBalancedStrategy,
  structureFilteredRandomStrategy,
} from "./strategies";
import { mulberry32 } from "./experiment";

const STRATEGIES = {
  frequency: frequencyWeightedStrategy,
  recency: recencyBalancedStrategy,
  structure: structureFilteredRandomStrategy,
  antiCrowd: antiCrowdStrategy,
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

export function recommendTickets({ draws, tournament, count = 5, seed = 20260825 }) {
  const evidence = aggregateEvidence(tournament);
  const winner = evidence.find(x => x.consistentlyPositive);
  // If no candidate demonstrates a stable positive interval, do not pretend it has predictive evidence.
  const selectedName = winner?.name || "random";
  const selectedStrategy = STRATEGIES[selectedName] || randomStrategy;
  const rng = mulberry32(seed);
  const tickets = selectedStrategy({ history: draws, count, rng });
  return {
    selectedStrategy: selectedName,
    evidenceStatus: winner ? "candidate-edge" : "no-demonstrated-edge",
    explanation: winner
      ? `${selectedName} is the strongest current candidate across tested windows, but this remains experimental rather than predictive proof.`
      : "No tested strategy currently demonstrates a stable advantage over random selection. Candidate tickets therefore use the random baseline rather than overstating an edge.",
    evidence,
    tickets,
  };
}
