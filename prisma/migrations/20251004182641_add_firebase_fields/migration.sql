-- Add Firebase fields to User table
-- First, add the new columns as nullable
ALTER TABLE "User" ADD COLUMN "uid" TEXT;
ALTER TABLE "User" ADD COLUMN "photoURL" TEXT;
ALTER TABLE "User" ADD COLUMN "role" TEXT;

-- For existing users, generate a temporary uid based on their email
-- This will be replaced when they authenticate with Firebase
UPDATE "User" SET "uid" = 'temp_' || "id" WHERE "uid" IS NULL;

-- Now make uid required and add unique constraint
ALTER TABLE "User" ALTER COLUMN "uid" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_uid_key" UNIQUE ("uid");

-- Remove the passwordHash column since we're using Firebase auth
ALTER TABLE "User" DROP COLUMN "passwordHash";
