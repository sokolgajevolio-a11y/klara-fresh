import { normalizeDraw } from "./engine";

const NY_POWERBALL_URL = "https://data.ny.gov/api/v3/views/d6yy-54nr/query.json?accessType=DOWNLOAD";
const CURRENT_MATRIX_START = "2015-10-07";

export async function fetchCurrentMatrixDraws() {
  const response = await fetch(NY_POWERBALL_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`NY Open Data request failed: ${response.status}`);

  const rows = await response.json();
  const seen = new Set();
  const draws = [];

  for (const row of rows) {
    const date = String(row.draw_date || "").slice(0, 10);
    if (!date || date < CURRENT_MATRIX_START || seen.has(date)) continue;

    const nums = String(row.winning_numbers || "")
      .trim()
      .split(/\s+/)
      .map(Number);
    if (nums.length !== 6) continue;

    try {
      const draw = normalizeDraw({
        date,
        white: nums.slice(0, 5),
        powerball: nums[5],
      });
      draws.push(draw);
      seen.add(date);
    } catch {
      // Reject malformed/out-of-era rows instead of contaminating experiments.
    }
  }

  draws.sort((a, b) => a.date.localeCompare(b.date));
  if (!draws.length) throw new Error("No valid current-matrix Powerball draws returned");
  return draws;
}
