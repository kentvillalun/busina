-- CreateTable
CREATE TABLE "WaitingSpot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commuterId" UUID NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "direction" "Direction" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitingSpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitingSpot_commuterId_key" ON "WaitingSpot"("commuterId");

-- CreateIndex
CREATE INDEX "WaitingSpot_expiresAt_idx" ON "WaitingSpot"("expiresAt");

-- AddForeignKey
ALTER TABLE "WaitingSpot" ADD CONSTRAINT "WaitingSpot_commuterId_fkey" FOREIGN KEY ("commuterId") REFERENCES "Commuter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
