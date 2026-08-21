-- AlterTable
ALTER TABLE `reservations` ADD COLUMN `reschedule_date` DATE NULL,
    ADD COLUMN `rescheduled_from` DATE NULL;
