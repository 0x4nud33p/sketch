/*
  Warnings:

  - You are about to drop the column `x` on the `Drawing` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Drawing` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Drawing" DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "centerX" DOUBLE PRECISION,
ADD COLUMN     "centerY" DOUBLE PRECISION,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "points" JSONB,
ADD COLUMN     "radius" DOUBLE PRECISION,
ADD COLUMN     "startX" DOUBLE PRECISION,
ADD COLUMN     "startY" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "username";
