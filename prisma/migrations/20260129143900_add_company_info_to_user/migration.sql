-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyBanner" TEXT,
ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "companyLocationDescription" TEXT,
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyRegistrationNumber" TEXT,
ADD COLUMN     "companySocialMedia" TEXT,
ADD COLUMN     "companySocialMediaIcon" TEXT,
ADD COLUMN     "companySocialMediaUrl" TEXT,
ADD COLUMN     "newsLetterEmailSubscription" BOOLEAN DEFAULT false,
ADD COLUMN     "newsLetterSMSSubscription" BOOLEAN DEFAULT false;
