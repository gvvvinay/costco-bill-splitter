-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "amountOwed" REAL NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "settledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Settlement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BillSplitSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillSplitSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "settledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BillSplitSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BillSplitSession" ("createdAt", "id", "name", "receiptUrl", "taxAmount", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "id", "name", "receiptUrl", "taxAmount", "totalAmount", "updatedAt", "userId" FROM "BillSplitSession";
DROP TABLE "BillSplitSession";
ALTER TABLE "new_BillSplitSession" RENAME TO "BillSplitSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
