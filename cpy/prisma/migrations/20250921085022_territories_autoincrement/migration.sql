/*
  Warnings:

  - You are about to alter the column `territoryId` on the `complaints` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `territoryId` on the `employee_territories` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `territories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `territoryId` on the `territories` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `complaints` DROP FOREIGN KEY `complaints_territoryId_fkey`;

-- DropForeignKey
ALTER TABLE `employee_territories` DROP FOREIGN KEY `employee_territories_territoryId_fkey`;

-- DropIndex
DROP INDEX `complaints_territoryId_fkey` ON `complaints`;

-- DropIndex
DROP INDEX `employee_territories_territoryId_fkey` ON `employee_territories`;

-- AlterTable
ALTER TABLE `complaints` MODIFY `territoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `employee_territories` MODIFY `territoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `territories` DROP PRIMARY KEY,
    MODIFY `territoryId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`territoryId`);

-- AddForeignKey
ALTER TABLE `employee_territories` ADD CONSTRAINT `employee_territories_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territories`(`territoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territories`(`territoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;
