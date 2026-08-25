const NY_POWERBALL_API = "https://data.ny.gov/resource/d6yy-54nr.json?$limit=5000&$order=draw_date%20ASC";
const CURRENT_MATRIX_START = "2015-10-07";

function toDateOnly(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function parseWinningNumbers(value) {
  const numbers = String(value || "")
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite);
  if (numbers.length !== 6) return null;
  return { white: numbers.slice(0, 5).sort((a, b) => a - b), powerball: numbers[5] };
}

export async function fetchPowerballDataset() {
  const response = await fetch(NY_POWERBALL_API, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Powerball dataset request failed: ${response.status}`);
  }

  const rows = await response.json();
  const seen = new Set();
  const draws = [];

  for (const row of rows) {
    const date = toDateOnly(row.draw_date);
    if (!date || date < CURRENT_MATRIX_START || seen.has(date)) continue;
    const parsed = parseWinningNumbers(row.winning_numbers);
    if (!parsed) continue;
    const validWhite = parsed.white.length === 5 && new Set(parsed.white).size === 5 && parsed.white.every(n => n >= 1 && n <= 69);
    const validPB = parsed.powerball >= 1 && parsed.powerball <= 26;
    if (!validWhite || !validPB) continue;
    seen.add(date);
    draws.push({ date, ...parsed, multiplier: Number(row.multiplier) || null });
  }

  draws.sort((a, b) => a.date.localeCompare(b.date));
  if (!draws.length) throw new Error("No valid current-era Powerball draws were returned");
  return draws;
}

export const POWERBALL_DATASET_INFO = Object.freeze({
  provider: "New York State Gaming Commission / data.ny.gov",
  datasetId: "d6yy-54nr",
  currentMatrixStart: CURRENT_MATRIX_START,
});
