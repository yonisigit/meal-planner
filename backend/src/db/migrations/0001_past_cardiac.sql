PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dishes_rank` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`dish_id` text NOT NULL,
	`rank` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_dishes_rank`("id", "user_id", "guest_id", "dish_id", "rank", "created_at", "updated_at") SELECT "id", "user_id", "guest_id", "dish_id", "rank", "created_at", "updated_at" FROM `dishes_rank`;--> statement-breakpoint
DROP TABLE `dishes_rank`;--> statement-breakpoint
ALTER TABLE `__new_dishes_rank` RENAME TO `dishes_rank`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_dishes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_dishes`("id", "name", "description", "user_id", "created_at", "updated_at") SELECT "id", "name", "description", "user_id", "created_at", "updated_at" FROM `dishes`;--> statement-breakpoint
DROP TABLE `dishes`;--> statement-breakpoint
ALTER TABLE `__new_dishes` RENAME TO `dishes`;