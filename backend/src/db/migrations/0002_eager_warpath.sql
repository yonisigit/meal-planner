CREATE TABLE `meal_guests` (
	`meal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	FOREIGN KEY (`meal_id`) REFERENCES `meals_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_guests_meal_id_guest_id_unique` ON `meal_guests` (`meal_id`,`guest_id`);--> statement-breakpoint
CREATE TABLE `meals_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
