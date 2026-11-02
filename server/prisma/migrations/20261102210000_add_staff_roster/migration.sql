-- AlterTable
ALTER TABLE "User" ADD COLUMN     "busId" UUID,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_busId_idx" ON "User"("busId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
