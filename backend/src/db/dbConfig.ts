import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator"
import env from "../config/validateEnv.js"
import path from "path";

const turso = createClient({
  url: env.TURSO_DATABASE_URL!,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso);

export async function runMigrations() {
  try {
    const migrationsFolder = path.resolve(process.cwd(), "src/db/migrations");
    await migrate(db, { migrationsFolder });
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

