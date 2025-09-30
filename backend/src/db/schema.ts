import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const usersTable = sqliteTable("users", {
  username: text("username").notNull().primaryKey(),
  password: text("password").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof usersTable.$inferInsert;

export const guestsTable = sqliteTable("guests", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  username: text("username").notNull().references(() => usersTable.username, {onDelete: "cascade"}),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Guest = typeof guestsTable.$inferSelect;

export const dishesTable = sqliteTable("dishes", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  username: text("username").notNull().references(() => usersTable.username, {onDelete: "cascade"}),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Dish = typeof dishesTable.$inferInsert;

export const dishesRankTable = sqliteTable("dishes_rank", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  username: text("username").notNull().references(() => usersTable.username, { onDelete: "cascade" }),
  guestId: text("guest_id").notNull().references(() => guestsTable.id, { onDelete: "cascade" }),
  dishId: text("dish_id").notNull().references(() => dishesTable.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type DishRank = typeof dishesRankTable.$inferInsert;
