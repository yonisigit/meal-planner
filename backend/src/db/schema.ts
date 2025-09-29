import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const usersTable = sqliteTable("users", {
  userName: text("user_name").notNull().primaryKey(),
  password: text("password").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof usersTable.$inferSelect;

export const guestsTable = sqliteTable("guests", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  userName: text("user_name").notNull().references(() => usersTable.userName, {onDelete: "cascade"}),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Guest = typeof guestsTable.$inferSelect;

export const dishesTable = sqliteTable("dishes", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  userName: text("user_name").notNull().references(() => usersTable.userName, {onDelete: "cascade"}),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Dish = typeof dishesTable.$inferSelect;

export const dishesRankTable = sqliteTable("dishes_rank", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  userName: text("user_name").notNull().references(() => usersTable.userName, { onDelete: "cascade" }),
  guestId: text("guest_id").notNull().references(() => guestsTable.id, { onDelete: "cascade" }),
  dishId: text("dish_id").notNull().references(() => dishesTable.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type DishRank = typeof dishesRankTable.$inferSelect;
