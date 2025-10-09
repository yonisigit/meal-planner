import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof usersTable.$inferInsert;

export const guestsTable = sqliteTable("guests", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Guest = typeof guestsTable.$inferInsert;

export const dishesTable = sqliteTable("dishes", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Dish = typeof dishesTable.$inferInsert;

export const dishesRankTable = sqliteTable("dishes_rank", {
  id: text("id").primaryKey().notNull().$defaultFn(() => randomUUID()),
  guestId: text("guest_id").notNull().references(() => guestsTable.id, { onDelete: "cascade" }),
  dishId: text("dish_id").notNull().references(() => dishesTable.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
},
  (t) => [unique().on(t.guestId, t.dishId)]
);

export type DishRank = typeof dishesRankTable.$inferInsert;
