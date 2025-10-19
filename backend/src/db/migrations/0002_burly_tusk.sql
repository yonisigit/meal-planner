ALTER TABLE `meals_table` RENAME TO `meals`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_meals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_meals`("id", "user_id", "date", "name", "description", "created_at", "updated_at") SELECT "id", "user_id", "date", "name", "description", "created_at", "updated_at" FROM `meals`;--> statement-breakpoint
DROP TABLE `meals`;--> statement-breakpoint
ALTER TABLE `__new_meals` RENAME TO `meals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_meal_guests` (
	`meal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_meal_guests`("meal_id", "guest_id", "created_at", "updated_at") SELECT "meal_id", "guest_id", "created_at", "updated_at" FROM `meal_guests`;--> statement-breakpoint
DROP TABLE `meal_guests`;--> statement-breakpoint
ALTER TABLE `__new_meal_guests` RENAME TO `meal_guests`;--> statement-breakpoint
CREATE UNIQUE INDEX `meal_guests_meal_id_guest_id_unique` ON `meal_guests` (`meal_id`,`guest_id`);