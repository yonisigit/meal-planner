INSERT OR IGNORE INTO "users" ("id", "username", "password", "created_at", "updated_at") VALUES
  ('seed-user-1', 'testchef', 'password123', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO "dishes" ("id", "name", "description", "user_id", "created_at", "updated_at") VALUES
  ('seed-dish-1', 'Lemon Herb Chicken', 'Roasted chicken with fresh herbs and lemon butter.', 'seed-user-1', '2024-01-02T00:00:00.000Z', '2024-01-02T00:00:00.000Z'),
  ('seed-dish-2', 'Spring Veggie Pasta', 'Pasta tossed with seasonal vegetables and basil pesto.', 'seed-user-1', '2024-01-02T00:00:00.000Z', '2024-01-02T00:00:00.000Z'),
  ('seed-dish-3', 'Dark Chocolate Tart', 'Silky ganache tart with sea salt flakes.', 'seed-user-1', '2024-01-02T00:00:00.000Z', '2024-01-02T00:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO "guests" ("id", "name", "user_id", "created_at", "updated_at") VALUES
  ('seed-guest-1', 'Alex Johnson', 'seed-user-1', '2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z'),
  ('seed-guest-2', 'Bianca Lee', 'seed-user-1', '2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z'),
  ('seed-guest-3', 'Carlos Ramirez', 'seed-user-1', '2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO "meals_table" ("id", "user_id", "date", "name", "description", "created_at", "updated_at") VALUES
  ('seed-meal-1', 'seed-user-1', '2024-05-15', 'Spring Feast', 'Casual dinner to try seasonal dishes.', '2024-01-04T00:00:00.000Z', '2024-01-04T00:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO "meal_guests" ("meal_id", "guest_id") VALUES
  ('seed-meal-1', 'seed-guest-1'),
  ('seed-meal-1', 'seed-guest-2'),
  ('seed-meal-1', 'seed-guest-3');
--> statement-breakpoint
INSERT OR IGNORE INTO "dishes_rank" ("id", "guest_id", "dish_id", "rank", "created_at", "updated_at") VALUES
  ('seed-rank-1', 'seed-guest-1', 'seed-dish-1', 1, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),
  ('seed-rank-2', 'seed-guest-1', 'seed-dish-2', 2, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),
  ('seed-rank-3', 'seed-guest-2', 'seed-dish-2', 1, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),
  ('seed-rank-4', 'seed-guest-2', 'seed-dish-3', 2, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),
  ('seed-rank-5', 'seed-guest-3', 'seed-dish-1', 2, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),
  ('seed-rank-6', 'seed-guest-3', 'seed-dish-3', 1, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z');