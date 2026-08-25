import { CURRENT_MATRIX_START, prepareCurrentMatrixDataset } from "./dataset";

// Texas Lottery publishes a CSV containing Powerball drawings since 2010.
// Current-matrix analysis MUST filter to 2015-10-07+ before use.
export const TEXAS_POWERBALL_CSV_URL =
  "https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/powerball.csv";

export function parseTexasPowerballCsv(csvText) {
  if (typeof csvText !== "string" || !csvText.trim()) {
    throw new Error("Texas Powerball CSV text is required");
  }

  const rows = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const draws = [];
  const rejected = [];

  for (let i = 0; i < rows.length; i++) {
    const columns = rows[i].split(",").map(value => value.trim().replace(/^\"|\"$/g, ""));
    // Expected current-era layout:
    // Game Name, Month, Day, Year, Num1..Num5, Powerball, Power Play
    if (columns.length < 10) {
      rejected.push({ row: i + 1, reason: "too_few_columns", raw: rows[i] });
      continue;
    }

    const month = Number(columns[1]);
    const day = Number(columns[2]);
    const year = Number(columns[3]);
    const white = columns.slice(4, 9).map(Number);
    const powerball = Number(columns[9]);

    if (![month, day, year, ...white, powerball].every(Number.isFinite)) {
      // Allows a header row to be safely ignored.
      rejected.push({ row: i + 1, reason: "non_numeric_draw", raw: rows[i] });
      continue;
    }

    const date = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    draws.push({ date, white, powerball, source: "texas-lottery" });
  }

  const prepared = prepareCurrentMatrixDataset(draws);
  return {
    source: "Texas Lottery",
    currentMatrixStart: CURRENT_MATRIX_START,
    rawRows: rows.length,
    parsedRows: draws.length,
    parserRejected: rejected,
    ...prepared,
  };
}

export async function fetchTexasPowerballDataset(fetchImpl = fetch) {
  const response = await fetchImpl(TEXAS_POWERBALL_CSV_URL, {
    headers: { accept: "text/csv,text/plain;q=0.9,*/*;q=0.1" },
  });
  if (!response.ok) throw new Error(`Texas Lottery download failed: HTTP ${response.status}`);
  return parseTexasPowerballCsv(await response.text());
}
