import { normalizeDraw } from "./engine";

export const CURRENT_MATRIX_START = "2015-10-07";

function parseDate(value) {
  if (!value) throw new Error("Draw date is required");
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error(`Unsupported draw date: ${s}`);
  const [, m, d, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function normalizeHistoricalRow(row) {
  const date = parseDate(row.date || row.drawDate || row[0]);
  const rawWhite = row.white || row.whiteBalls || row.numbers || row.slice?.(1, 6);
  const white = Array.isArray(rawWhite)
    ? rawWhite.map(Number)
    : String(rawWhite).split(/\s*[-, ]\s*/).filter(Boolean).map(Number);
  const powerball = Number(row.powerball ?? row.pb ?? row[6]);
  return normalizeDraw({ date, white, powerball });
}

export function currentMatrixOnly(rows) {
  return rows
    .map(normalizeHistoricalRow)
    .filter(draw => draw.date >= CURRENT_MATRIX_START)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function validateDataset(rows) {
  const draws = currentMatrixOnly(rows);
  const seenDates = new Set();
  const errors = [];
  for (const draw of draws) {
    if (seenDates.has(draw.date)) errors.push(`Duplicate draw date: ${draw.date}`);
    seenDates.add(draw.date);
  }
  return {
    valid: errors.length === 0,
    errors,
    draws,
    drawCount: draws.length,
    firstDate: draws[0]?.date || null,
    lastDate: draws.at(-1)?.date || null,
  };
}

// Adapter for the Texas Lottery Powerball table/export shape.
export function fromTexasLotteryRows(rows) {
  return validateDataset(rows.map(row => ({
    date: row.drawDate ?? row.date ?? row[0],
    white: row.winningNumbers ?? row.white ?? row.numbers ?? row.slice?.(1, 6),
    powerball: row.powerball ?? row.pb ?? row[6],
  })));
}
