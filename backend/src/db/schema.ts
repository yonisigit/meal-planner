import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const guests = sqliteTable("guests", {
  bar: text("bar").notNull().default("Hey!"),
});