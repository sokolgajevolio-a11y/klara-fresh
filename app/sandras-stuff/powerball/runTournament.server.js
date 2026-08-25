import { fetchCurrentMatrixDraws } from "./nyOpenData.server";
import { runTournament, rollingRobustness } from "./experiment";
import {
  randomStrategy,
  frequencyWeightedStrategy,
  recencyBalancedStrategy,
  structureFilteredRandomStrategy,
  antiCrowdStrategy,
} from "./strategies";

export async function runPowerballTournament(options = {}) {
  const draws = await fetchCurrentMatrixDraws();
  const baseline = randomStrategy;
  const strategies = {
    frequencyWeighted: frequencyWeightedStrategy,
    recencyBalanced: recencyBalancedStrategy,
    structureFiltered: structureFilteredRandomStrategy,
    antiCrowd: antiCrowdStrategy,
  };

  const tournament = runTournament({
    draws,
    baseline,
    strategies,
    warmup: options.warmup ?? 200,
    ticketsPerDraw: options.ticketsPerDraw ?? 1,
    seed: options.seed ?? 20260825,
  });

  const robustness = rollingRobustness({
    draws,
    baseline,
    strategies,
    warmups: options.warmups ?? [100, 200, 300],
    ticketsPerDraw: options.ticketsPerDraw ?? 1,
    seeds: options.seeds ?? [11, 29, 47, 83, 131],
  });

  return {
    dataset: {
      draws: draws.length,
      firstDraw: draws[0]?.date,
      lastDraw: draws.at(-1)?.date,
    },
    tournament,
    robustness,
  };
}
