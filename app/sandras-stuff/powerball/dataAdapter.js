import { normalizeDraw } from "./engine";

// Stable internal format for every historical draw. Keep source parsing outside the math engine.
export function toInternalDraw(record) {
  const draw = normalizeDraw({
    date: record.date || record.drawDate || record.draw_date || null,
    white: record.white || record.whiteBalls || record.numbers || [],
    powerball: record.powerball ?? record.pb ?? record.redBall,
  });
  return {
    date: draw.date || null,
    white: draw.white,
    powerball: draw.powerball,
    powerPlay: record.powerPlay ?? record.power_play ?? null,
    source: record.source || "unknown",
  };
}

export function parseSimpleCsv(csvText, { source = "import" } = {}) {
  const lines = String(csvText).trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(x => x.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const cells = line.split(",").map(x => x.trim());
    const row = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
    const white = [row.n1, row.n2, row.n3, row.n4, row.n5].map(Number);
    return toInternalDraw({
      date: row.date,
      white,
      powerball: Number(row.powerball || row.pb),
      powerPlay: row.powerplay || row.power_play || null,
      source,
    });
  });
}

export function sortDrawsChronologically(draws) {
  return [...draws].map(toInternalDraw).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}
