DROP INDEX "dishes_rank_guest_id_dish_id_unique";--> statement-breakpoint
DROP INDEX "meal_guests_meal_id_guest_id_unique";--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "name" TO "name" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `dishes_rank_guest_id_dish_id_unique` ON `dishes_rank` (`guest_id`,`dish_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `meal_guests_meal_id_guest_id_unique` ON `meal_guests` (`meal_id`,`guest_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);