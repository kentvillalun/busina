-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('IN_SERVICE', 'AT_REST', 'STOPOVER');

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "serviceStatus" "ServiceStatus" NOT NULL DEFAULT 'IN_SERVICE';
