/*
  Warnings:

  - You are about to drop the column `explicit` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Release" DROP COLUMN "explicit",
DROP COLUMN "genre";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "explicit";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;
