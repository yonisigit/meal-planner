import { text, sqliteTable } from "drizzle-orm/sqlite-core";
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
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  userName: text("user_name").notNull().references(() => usersTable.userName, {onDelete: "cascade"}),
});

export type Guest = typeof guestsTable.$inferSelect;
