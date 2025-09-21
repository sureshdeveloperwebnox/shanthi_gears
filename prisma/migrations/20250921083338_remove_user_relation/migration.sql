/*
  Warnings:

  - You are about to drop the column `userId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `employees` DROP FOREIGN KEY `Employees_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_roleId_fkey`;

-- DropIndex
DROP INDEX `Employees_userId_fkey` ON `employees`;

-- AlterTable
ALTER TABLE `employees` DROP COLUMN `userId`;

-- DropTable
DROP TABLE `users`;
