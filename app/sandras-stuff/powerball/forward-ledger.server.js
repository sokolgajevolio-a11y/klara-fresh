import prisma from "../../db.server";
import { createPredictionSnapshot, settlePredictionSnapshot, summarizeForwardLedger } from "./forward-ledger";

export async function recordForwardPrediction({ shop, targetDrawDate, latestKnownDrawDate, recommendation, generatedAt = new Date() }) {
  const snapshot = createPredictionSnapshot({
    targetDrawDate,
    generatedAt: generatedAt.toISOString(),
    latestKnownDrawDate,
    recommendation,
  });

  return prisma.powerballPrediction.create({
    data: {
      shop,
      targetDrawDate,
      generatedAt,
      latestKnownDrawDate,
      selectedStrategy: snapshot.selectedStrategy,
      evidenceStatus: snapshot.evidenceStatus,
      snapshotJson: JSON.stringify(snapshot),
    },
  });
}

export async function settleAvailablePredictions({ shop, draws }) {
  const actualByDate = new Map(draws.map(draw => [draw.date, draw]));
  const pending = await prisma.powerballPrediction.findMany({ where: { shop, settled: false }, orderBy: { targetDrawDate: "asc" } });
  const settled = [];

  for (const row of pending) {
    const actual = actualByDate.get(row.targetDrawDate);
    if (!actual) continue;
    const snapshot = JSON.parse(row.snapshotJson);
    const result = settlePredictionSnapshot(snapshot, actual);
    settled.push(await prisma.powerballPrediction.update({
      where: { id: row.id },
      data: { settled: true, settledAt: new Date(), resultJson: JSON.stringify(result) },
    }));
  }
  return settled;
}

export async function getForwardLedger({ shop }) {
  const rows = await prisma.powerballPrediction.findMany({ where: { shop }, orderBy: { targetDrawDate: "desc" } });
  const entries = rows.map(row => row.settled && row.resultJson ? JSON.parse(row.resultJson) : JSON.parse(row.snapshotJson));
  return { rows, entries, summary: summarizeForwardLedger(entries) };
}
