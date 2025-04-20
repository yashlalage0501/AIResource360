/*
  Warnings:

  - You are about to drop the column `difficultyLevel` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "difficultyLevel",
ADD COLUMN     "difficulty" TEXT;
