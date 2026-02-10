-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyOnLotEndingSoon" BOOLEAN DEFAULT true,
ADD COLUMN     "notifyOnOutbid" BOOLEAN DEFAULT true,
ADD COLUMN     "notifyOnWin" BOOLEAN DEFAULT true;
