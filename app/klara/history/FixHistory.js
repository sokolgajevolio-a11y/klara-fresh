const FixHistory = [];

export function logFix(entry) {
  FixHistory.push({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...entry
  });
}

export function getFixHistory() {
  return FixHistory;
}

export function undoLastFix() {
  const last = FixHistory.pop();
  if (!last || !last.undo) return;
  last.undo();
}
