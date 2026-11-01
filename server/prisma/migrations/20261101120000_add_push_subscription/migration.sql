-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "spotLat" DOUBLE PRECISION NOT NULL,
    "spotLng" DOUBLE PRECISION NOT NULL,
    "alertMinutes" INTEGER NOT NULL,
    "direction" "Direction" NOT NULL,
    "targetBusId" UUID,
    "notifiedBusIds" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
