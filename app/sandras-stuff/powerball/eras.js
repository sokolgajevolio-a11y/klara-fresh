// Powerball has changed its number matrix over time. Never mix incompatible eras
// in a model that assumes the current 5/69 + 1/26 probability space.
export const POWERBALL_ERAS = Object.freeze([
  {
    id: "current-5-69-1-26",
    startDate: "2015-10-07",
    endDate: null,
    whiteMax: 69,
    powerballMax: 26,
    compatibleWithCurrentModel: true,
  },
]);

export function currentMatrixDraws(draws) {
  return draws.filter(draw => {
    const date = String(draw.date || draw.drawDate || "").slice(0, 10);
    return date >= "2015-10-07";
  });
}

export function assertCurrentMatrix(draws) {
  const incompatible = draws.filter(draw => {
    const date = String(draw.date || draw.drawDate || "").slice(0, 10);
    return !date || date < "2015-10-07";
  });
  if (incompatible.length) {
    throw new Error(`Dataset contains ${incompatible.length} draw(s) outside the current Powerball matrix era`);
  }
  return draws;
}
