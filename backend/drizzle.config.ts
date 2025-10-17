import "dotenv/config"; 
import env from "./dist/config/validateEnv.js" // import from dist bc the config file is run by drizzle in a seperate process and expects js
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL!,
    authToken: env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;