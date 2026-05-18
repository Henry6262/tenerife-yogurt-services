-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "stripePaymentIntentId" TEXT;
