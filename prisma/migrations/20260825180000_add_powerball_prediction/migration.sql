CREATE TABLE "PowerballPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "targetDrawDate" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latestKnownDrawDate" TEXT,
    "selectedStrategy" TEXT NOT NULL,
    "evidenceStatus" TEXT NOT NULL,
    "snapshotJson" TEXT NOT NULL,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "settledAt" DATETIME,
    "resultJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "PowerballPrediction_shop_targetDrawDate_key" ON "PowerballPrediction"("shop", "targetDrawDate");
CREATE INDEX "PowerballPrediction_shop_settled_targetDrawDate_idx" ON "PowerballPrediction"("shop", "settled", "targetDrawDate");
