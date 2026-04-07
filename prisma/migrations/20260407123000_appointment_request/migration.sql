-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('IN_PERSON', 'VIRTUAL', 'PHONE');

-- CreateEnum
CREATE TYPE "AppointmentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AppointmentRequest" (
  "id" TEXT NOT NULL,
  "requesterName" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "requesterPhone" TEXT,
  "appointmentDate" TIMESTAMP(3) NOT NULL,
  "appointmentType" "AppointmentType" NOT NULL,
  "notes" TEXT,
  "status" "AppointmentRequestStatus" NOT NULL DEFAULT 'PENDING',
  "adminNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppointmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentRequest_status_appointmentDate_idx" ON "AppointmentRequest"("status", "appointmentDate");
CREATE INDEX "AppointmentRequest_requesterEmail_idx" ON "AppointmentRequest"("requesterEmail");
CREATE INDEX "AppointmentRequest_reviewedById_idx" ON "AppointmentRequest"("reviewedById");

-- AddForeignKey
ALTER TABLE "AppointmentRequest"
ADD CONSTRAINT "AppointmentRequest_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
