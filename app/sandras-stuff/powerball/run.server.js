import { runTournament, mulberry32 } from "./experiment";
import {
  randomStrategy,
  frequencyWeightedStrategy,
  recencyBalancedStrategy,
  structureFilteredRandomStrategy,
  antiCrowdStrategy,
} from "./strategies";

function seeded(strategy, seed) {
  return (args) => strategy({ ...args, rng: mulberry32(seed + (args.targetIndex || 0)) });
}

export async function runLiveTournament(draws) {
  const windows = [100, 200, 300].filter(warmup => draws.length > warmup);
  return windows.map((warmup, index) => {
    const seedBase = 10000 + index * 1000;
    const baseline = seeded(randomStrategy, seedBase);
    const strategies = {
      frequencyWeighted: seeded(frequencyWeightedStrategy, seedBase + 101),
      recencyBalanced: seeded(recencyBalancedStrategy, seedBase + 202),
      structureFiltered: seeded(structureFilteredRandomStrategy, seedBase + 303),
      antiCrowd: seeded(antiCrowdStrategy, seedBase + 404),
    };

    const tournament = runTournament({
      draws,
      baseline,
      strategies,
      warmup,
      ticketsPerDraw: 1,
    });

    return {
      warmup,
      baseline: tournament.baseline,
      ranking: tournament.ranking,
      interpretation: tournament.interpretation,
    };
  });
}
