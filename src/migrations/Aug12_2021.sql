-- Altering `customers` table to allow some column defaults to be null

ALTER TABLE `customers` MODIFY `first_name` varchar(255) DEFAULT NULL;
ALTER TABLE `customers` MODIFY `last_name` varchar(255) DEFAULT NULL;
ALTER TABLE `customers` MODIFY `prefix` varchar(255) DEFAULT NULL;
ALTER TABLE `customers` MODIFY `email` varchar(255) DEFAULT NULL;
ALTER TABLE `customers` MODIFY `gender` varchar(255) DEFAULT NULL;

