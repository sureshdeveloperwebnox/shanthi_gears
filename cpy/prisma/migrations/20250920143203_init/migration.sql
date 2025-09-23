-- CreateTable
CREATE TABLE `employee_territories` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `territoryId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employees` (
    `employeeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Employees_email_key`(`email`),
    PRIMARY KEY (`employeeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_username_key`(`username`),
    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `roleId` VARCHAR(191) NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Roles_roleName_key`(`roleName`),
    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Territories` (
    `territoryId` VARCHAR(191) NOT NULL,
    `territoryName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Territories_territoryName_key`(`territoryName`),
    PRIMARY KEY (`territoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaints` (
    `complaintId` VARCHAR(191) NOT NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `mailId` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `territoryId` VARCHAR(191) NOT NULL,
    `gearboxSerialNumber` VARCHAR(191) NOT NULL,
    `dateOfCommissioning` DATETIME(3) NOT NULL,
    `complaintDate` DATETIME(3) NOT NULL,
    `applicationDetails` VARCHAR(191) NOT NULL,
    `natureOfComplaintWithPhotos` VARCHAR(191) NOT NULL,
    `inputMotorDetailsKw` DECIMAL(65, 30) NOT NULL,
    `inputOutputConnectionDetails` VARCHAR(191) NOT NULL,
    `oilLevelDetails` VARCHAR(191) NOT NULL,
    `gradeOfOilUsed` VARCHAR(191) NOT NULL,
    `conditionOfOil` VARCHAR(191) NOT NULL,
    `conditionOfBreather` VARCHAR(191) NOT NULL,
    `sedimentInOilBottom` VARCHAR(191) NOT NULL,
    `alignmentInputOutput` VARCHAR(191) NOT NULL,
    `runningHoursPerDay` INTEGER NOT NULL,
    `startStopPerDay` INTEGER NOT NULL,
    `dismantledBeforeFailure` VARCHAR(191) NOT NULL,
    `ambientConditions` VARCHAR(191) NOT NULL,
    `loadSpectrum` VARCHAR(191) NOT NULL,
    `forcedLubricationPhotos` VARCHAR(191) NOT NULL,
    `conditionOfOtherParts` VARCHAR(191) NOT NULL,
    `lubricationCheckDetails` VARCHAR(191) NOT NULL,
    `inputSpeedDetails` VARCHAR(191) NOT NULL,
    `failureHistoryDetails` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`complaintId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_territories` ADD CONSTRAINT `employee_territories_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employees`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_territories` ADD CONSTRAINT `employee_territories_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territories`(`territoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employees` ADD CONSTRAINT `Employees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territories`(`territoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;
