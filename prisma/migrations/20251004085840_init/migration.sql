/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_uid_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "provider",
DROP COLUMN "uid",
ADD COLUMN     "passwordHash" TEXT NOT NULL;
