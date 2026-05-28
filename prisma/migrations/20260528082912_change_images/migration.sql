/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Ad` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ad" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
