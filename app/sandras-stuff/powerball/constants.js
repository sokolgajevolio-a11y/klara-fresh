export const POWERBALL_RULES = Object.freeze({
  whiteBallMin: 1,
  whiteBallMax: 69,
  whiteBallCount: 5,
  powerballMin: 1,
  powerballMax: 26,
});

export const DEFAULT_ANALYSIS_WINDOWS = Object.freeze([25, 50, 100, 250]);

// Initial research weights only. Backtesting must earn any future changes.
export const DEFAULT_STRATEGY = Object.freeze({
  frequencyWeight: 0.18,
  recencyWeight: 0.12,
  pairWeight: 0.16,
  spreadWeight: 0.14,
  parityWeight: 0.10,
  rangeWeight: 0.10,
  sumWeight: 0.10,
  antiCrowdWeight: 0.10,
});
