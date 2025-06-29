/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verification_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verification_expires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `InvoiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "vendorId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verified",
DROP COLUMN "verification_code",
DROP COLUMN "verification_expires";

-- DropTable
DROP TABLE "InvoiceItem";

-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "ExportHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "export_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER,
    "filters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ExportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "export_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "total_size" INTEGER NOT NULL DEFAULT 0,
    "avg_file_size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 100,

    CONSTRAINT "ExportAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportHistory_userId_created_at_idx" ON "ExportHistory"("userId", "created_at");

-- CreateIndex
CREATE INDEX "ExportHistory_export_type_format_idx" ON "ExportHistory"("export_type", "format");

-- CreateIndex
CREATE INDEX "ExportHistory_status_idx" ON "ExportHistory"("status");

-- CreateIndex
CREATE INDEX "ExportAnalytics_userId_date_idx" ON "ExportAnalytics"("userId", "date");

-- CreateIndex
CREATE INDEX "ExportAnalytics_export_type_format_idx" ON "ExportAnalytics"("export_type", "format");

-- CreateIndex
CREATE UNIQUE INDEX "ExportAnalytics_userId_date_export_type_format_key" ON "ExportAnalytics"("userId", "date", "export_type", "format");

-- AddForeignKey
ALTER TABLE "ExportHistory" ADD CONSTRAINT "ExportHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportAnalytics" ADD CONSTRAINT "ExportAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
