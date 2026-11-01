-- The anonymous subscriptions from before accounts have no owner, so they are removed (a NOT NULL column needs an empty table).
DELETE FROM "PushSubscription";

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "commuterId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Commuter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commuter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistedToken" (
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commuter_googleId_key" ON "Commuter"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Commuter_email_key" ON "Commuter"("email");

-- CreateIndex
CREATE INDEX "BlacklistedToken_expiresAt_idx" ON "BlacklistedToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PushSubscription_commuterId_idx" ON "PushSubscription"("commuterId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_commuterId_fkey" FOREIGN KEY ("commuterId") REFERENCES "Commuter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

